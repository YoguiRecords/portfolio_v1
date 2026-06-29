import { vi } from "vitest";

vi.mock("@/lib/actions/content-actions", () => ({ updateCvHtmlAction: vi.fn() }));

import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { CvEditor } from "./cv-editor";

test("rend l'aperçu dans une iframe sandboxée (isolation)", () => {
  render(<CvEditor initialHtml="<p>CV</p>" />);
  const iframe = screen.getByTitle("Aperçu du CV") as HTMLIFrameElement;
  expect(iframe).toBeInTheDocument();
  // Isolation : attribut sandbox présent (scripts bloqués)
  expect(iframe).toHaveAttribute("sandbox", "");
  expect(iframe).toHaveAttribute("srcdoc", "<p>CV</p>");
});
