import { expect, test } from "vitest";
import { sameOriginMediaUrl } from "./media-url";

test("sameOriginMediaUrl: réécrit une URL du bucket media en chemin same-origin", () => {
  // Arrange — base par défaut (dev) : http://localhost:9100/media
  const url = "http://localhost:9100/media/abc123.webp";

  // Act & Assert
  expect(sameOriginMediaUrl(url)).toBe("/media/abc123.webp");
});

test("sameOriginMediaUrl: laisse passer les URLs étrangères telles quelles", () => {
  expect(sameOriginMediaUrl("https://example.com/x.png")).toBe("https://example.com/x.png");
});
