// @vitest-environment node
import { expect, test } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

function request(path: string, hasSession: boolean): NextRequest {
  const r = new NextRequest(new URL(`http://bo.test${path}`));
  if (hasSession) r.cookies.set(SESSION_COOKIE_NAME, "x");
  return r;
}

test("une route protégée sans session redirige vers /login", () => {
  const res = proxy(request("/cv", false));
  expect(res.headers.get("location")).toContain("/login");
});

test("/internal est accessible sans session (garde par token, pas par la middleware)", () => {
  const res = proxy(request("/internal/cv-document", false));
  expect(res.headers.get("location")).toBeNull();
});

test("/api/internal est accessible sans session (garde par token)", () => {
  const res = proxy(request("/api/internal/availability", false));
  expect(res.headers.get("location")).toBeNull();
});

test("/login est accessible sans session", () => {
  const res = proxy(request("/login", false));
  expect(res.headers.get("location")).toBeNull();
});

test("une route protégée avec session passe", () => {
  const res = proxy(request("/cv", true));
  expect(res.headers.get("location")).toBeNull();
});
