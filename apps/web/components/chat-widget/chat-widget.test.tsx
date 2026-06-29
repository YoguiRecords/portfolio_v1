import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { ChatWidget } from "./chat-widget";

test("le widget ouvre le panneau au clic sur la bulle", async () => {
  const user = userEvent.setup();
  render(<ChatWidget />);
  expect(screen.queryByLabelText("Message")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /Ouvrir le chat/i }));
  expect(screen.getByLabelText("Message")).toBeInTheDocument();
});
