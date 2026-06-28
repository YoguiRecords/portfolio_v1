import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Gallery, type MediaItem } from "./gallery";

const base = { externalUrl: null, posterUrl: null, alt: null };

test("un média IMAGE rend une <img> avec alt et lazy", () => {
  const items: MediaItem[] = [
    { ...base, id: "1", kind: "IMAGE", url: "https://cdn/x.webp", alt: "Une image" },
  ];
  render(<Gallery items={items} />);
  const img = screen.getByAltText("Une image");
  expect(img.tagName).toBe("IMG");
  expect(img).toHaveAttribute("loading", "lazy");
});

test("un média EMBED rend une iframe vers l'URL externe", () => {
  const items: MediaItem[] = [
    { ...base, id: "2", kind: "EMBED", url: "", externalUrl: "https://youtube.com/embed/abc" },
  ];
  const { container } = render(<Gallery items={items} />);
  const iframe = container.querySelector("iframe");
  expect(iframe).toHaveAttribute("src", "https://youtube.com/embed/abc");
});

test("un EMBED avec URL non http est ignoré (pas d'iframe)", () => {
  const items: MediaItem[] = [
    { ...base, id: "3", kind: "EMBED", url: "", externalUrl: "javascript:alert(1)" },
  ];
  const { container } = render(<Gallery items={items} />);
  expect(container.querySelector("iframe")).toBeNull();
});
