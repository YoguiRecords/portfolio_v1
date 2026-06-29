import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { AboutPreview } from "./about-preview";

test("rend nom, accroche, méta et dispo", () => {
  render(
    <AboutPreview
      data={{
        fullName: "Yohan Debusscher",
        headline: "CTO & fondateur",
        currentRole: "CEO",
        location: "Lille",
        bio: "Bio courte.",
        availabilityLabel: "Disponible",
        isAvailable: true,
      }}
    />,
  );
  expect(screen.getByRole("heading", { name: "Yohan Debusscher" })).toBeInTheDocument();
  expect(screen.getByText("CTO & fondateur")).toBeInTheDocument();
  expect(screen.getByText("CEO · Lille")).toBeInTheDocument();
  expect(screen.getByText("Disponible")).toBeInTheDocument();
});
