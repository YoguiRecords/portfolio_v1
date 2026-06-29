import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Dropzone } from "./dropzone";

test("rejette un fichier non-image avec une erreur", async () => {
  const { container } = render(<Dropzone action={vi.fn()} />);
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  await userEvent.upload(input, new File(["x"], "doc.txt", { type: "text/plain" }), { applyAccept: false });
  expect(screen.getByRole("alert")).toHaveTextContent("Format non autorisé");
});

test("accepte une image et affiche son nom", async () => {
  const { container } = render(<Dropzone action={vi.fn()} />);
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  await userEvent.upload(input, new File(["x"], "photo.png", { type: "image/png" }));
  expect(screen.getByText(/photo\.png/)).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
