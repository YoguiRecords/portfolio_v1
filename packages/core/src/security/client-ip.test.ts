import { expect, test } from "vitest";
import { clientIpFromHeaders } from "./client-ip";

test("clientIpFromHeaders: privilégie X-Real-IP (posé par le proxy, non spoofable)", () => {
  // Arrange
  const headers = new Headers({
    "x-real-ip": "203.0.113.9",
    "x-forwarded-for": "6.6.6.6, 203.0.113.9",
  });

  // Act
  const ip = clientIpFromHeaders(headers);

  // Assert
  expect(ip).toBe("203.0.113.9");
});

test("clientIpFromHeaders: fallback dev — premier élément de X-Forwarded-For", () => {
  // Arrange
  const headers = new Headers({ "x-forwarded-for": "192.0.2.1, 10.0.0.1" });

  // Act
  const ip = clientIpFromHeaders(headers);

  // Assert
  expect(ip).toBe("192.0.2.1");
});

test("clientIpFromHeaders: aucun header → unknown", () => {
  // Arrange
  const headers = new Headers();

  // Act
  const ip = clientIpFromHeaders(headers);

  // Assert
  expect(ip).toBe("unknown");
});

test("clientIpFromHeaders: X-Real-IP vide → fallback puis unknown", () => {
  // Arrange
  const headers = new Headers({ "x-real-ip": "  ", "x-forwarded-for": "" });

  // Act
  const ip = clientIpFromHeaders(headers);

  // Assert
  expect(ip).toBe("unknown");
});
