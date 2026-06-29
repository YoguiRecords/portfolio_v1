import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/** next-intl middleware: locale detection + `/en` prefix handling. */
export default createMiddleware(routing);

export const config = {
  // Skip API, Next internals and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
