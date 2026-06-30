import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { parseMarkdown } from "./parse";

/** Renders parsed nodes into a bare container for assertions. */
function renderMarkdown(content: string) {
  return render(<div>{parseMarkdown(content)}</div>);
}

test("renders bold as <strong>", () => {
  renderMarkdown("Un texte **important** ici.");
  expect(screen.getByText("important").tagName).toBe("STRONG");
});

test("neutralizes injected HTML (rendered as inert text)", () => {
  const { container } = renderMarkdown("Avant <script>alert(1)</script> après");
  expect(container.querySelector("script")).toBeNull();
  expect(container.textContent).toContain("<script>alert(1)</script>");
});

test("blocks javascript: links (rendered as plain text)", () => {
  const { container } = renderMarkdown("[clic](javascript:alert(1))");
  expect(screen.queryByRole("link")).toBeNull();
  expect(container.textContent).toContain("clic");
});

test("renders http links as <a rel=noopener>", () => {
  renderMarkdown("[site](https://example.com)");
  const link = screen.getByRole("link", { name: "site" });
  expect(link).toHaveAttribute("href", "https://example.com");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
});

test("renders ## / ### headings and `- ` lists", () => {
  const { container } = renderMarkdown("## Titre\n\n- a\n- b");
  expect(container.querySelector("h2")?.textContent).toBe("Titre");
  expect(container.querySelectorAll("li")).toHaveLength(2);
});
