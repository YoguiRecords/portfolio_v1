import { vi } from "vitest";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/" }));

import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test } from "vitest";
import { CommandPalette } from "./command-palette";

beforeEach(() => push.mockReset());

test("s'ouvre via l'évènement, filtre et navigue", async () => {
  render(<CommandPalette />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  act(() => {
    window.dispatchEvent(new Event("open-command-palette"));
  });
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  await userEvent.type(screen.getByPlaceholderText(/Aller à/), "pipeline");
  await userEvent.click(screen.getByRole("button", { name: /Pipeline/ }));
  expect(push).toHaveBeenCalledWith("/pipeline");
});
