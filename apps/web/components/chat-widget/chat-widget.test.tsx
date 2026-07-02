import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, expect, test, vi } from "vitest";
import messages from "../../messages/fr.json";
import { ChatWidget } from "./chat-widget";

afterEach(() => {
  vi.restoreAllMocks();
});

function renderWidget() {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <ChatWidget />
    </NextIntlClientProvider>,
  );
}

test("le widget ouvre le panneau au clic sur la bulle", async () => {
  const user = userEvent.setup();
  renderWidget();
  expect(screen.queryByLabelText("Message")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /Ouvrir le chat/i }));
  expect(screen.getByLabelText("Message")).toBeInTheDocument();
});

test("le bouton Prendre RDV affiche le formulaire avec les créneaux groupés par jour", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ slots: ["2026-07-06T07:00:00.000Z"] }), {
      headers: { "content-type": "application/json" },
    }),
  );
  const user = userEvent.setup();
  renderWidget();
  await user.click(screen.getByRole("button", { name: /Ouvrir le chat/i }));
  await user.click(screen.getByRole("button", { name: "Prendre RDV" }));

  expect(screen.getByLabelText("Prénom")).toBeInTheDocument();
  expect(screen.getByLabelText("Téléphone")).toBeInTheDocument();
  // Groupé par jour : l'optgroup porte le jour, l'option l'heure.
  const group = await screen.findByRole("group", { name: /lundi 6 juillet/i });
  expect(group).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "09:00" })).toBeInTheDocument();
  expect(screen.getByText(/Créneaux de 30 min/i)).toBeInTheDocument();
});

test("un indicateur « écrit… » (live region) s'affiche pendant l'attente de la réponse", async () => {
  // Arrange — fetch lent pour observer l'état pending.
  vi.spyOn(globalThis, "fetch").mockImplementation(
    () =>
      new Promise((resolve) =>
        setTimeout(
          () => resolve(new Response(JSON.stringify({ reply: "Bonjour !" }), { headers: { "content-type": "application/json" } })),
          50,
        ),
      ),
  );
  const user = userEvent.setup();
  renderWidget();
  await user.click(screen.getByRole("button", { name: /Ouvrir le chat/i }));

  // Act
  await user.type(screen.getByLabelText("Message"), "Salut");
  await user.click(screen.getByRole("button", { name: "→" }));

  // Assert — indicateur pendant l'attente, réponse annoncée dans le log.
  expect(screen.getByText(/Friday écrit…/)).toBeInTheDocument();
  expect(screen.getByRole("log")).toBeInTheDocument();
  expect(await screen.findByText("Bonjour !")).toBeInTheDocument();
  expect(screen.queryByText(/Friday écrit…/)).not.toBeInTheDocument();
});
