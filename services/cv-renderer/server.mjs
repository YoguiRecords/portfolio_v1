import http from "node:http";
import { chromium } from "playwright";

/**
 * cv-renderer — internal, hardened headless service. On `POST /render {locale}`
 * it loads the admin internal CV route and prints it to a PDF (A4, backgrounds).
 *
 * Talks ONLY to the admin app over the internal Docker network (no Internet).
 * Authenticates to the guarded internal route with the shared `CV_RENDER_TOKEN`.
 */

const PORT = Number(process.env.PORT ?? 5051);
const ADMIN_URL = process.env.ADMIN_INTERNAL_URL ?? "http://admin:3101";
const TOKEN = process.env.CV_RENDER_TOKEN ?? "";
const NAV_TIMEOUT = 30_000;

/** Lazily-launched shared browser (reused across requests). */
let browserPromise;
function getBrowser() {
  if (!browserPromise) {
    // --no-sandbox: required in a non-privileged container. Playwright places the
    // browser profile under the system temp dir (/tmp, a tmpfs) so the root
    // filesystem can stay read-only.
    browserPromise = chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  }
  return browserPromise;
}

/** Renders the admin CV document for `locale` to PDF bytes. */
async function renderPdf(locale) {
  const browser = await getBrowser();
  const context = await browser.newContext({
    extraHTTPHeaders: TOKEN ? { "x-cv-token": TOKEN } : {},
  });
  try {
    const page = await context.newPage();
    const url = `${ADMIN_URL}/internal/cv-document?locale=${encodeURIComponent(locale)}`;
    const resp = await page.goto(url, { waitUntil: "load", timeout: NAV_TIMEOUT });
    if (!resp || !resp.ok()) {
      throw new Error(`upstream responded ${resp ? resp.status() : "no response"}`);
    }
    // Ensure self-hosted fonts (Inter) are loaded before printing.
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print" });
    return await page.pdf({ printBackground: true, preferCSSPageSize: true });
  } finally {
    await context.close();
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }

  if (req.method === "POST" && req.url === "/render") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const locale = parsed.locale === "en" ? "en" : "fr";
        const pdf = await renderPdf(locale);
        res.writeHead(200, { "content-type": "application/pdf", "content-length": pdf.length });
        res.end(pdf);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // eslint-disable-next-line no-console
        console.error("render failed:", message);
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: message }));
      }
    });
    return;
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("not found");
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`cv-renderer listening on :${PORT}`);
});
