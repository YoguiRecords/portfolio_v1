import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { TrafficPanel } from "./traffic-panel";

test("affiche le repli quand le trafic n'est pas configuré", () => {
  render(<TrafficPanel traffic={{ configured: false, visitors: null, pageviews: null, deltaPct: null }} />);
  expect(screen.getByText(/non configurées/i)).toBeInTheDocument();
});

test("affiche visiteurs et variation quand configuré", () => {
  render(<TrafficPanel traffic={{ configured: true, visitors: 120, pageviews: 400, deltaPct: 12 }} />);
  expect(screen.getByText("120")).toBeInTheDocument();
  expect(screen.getByText(/12 %/)).toBeInTheDocument();
});
