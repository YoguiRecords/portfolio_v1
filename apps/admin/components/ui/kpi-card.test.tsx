import { render, screen } from "@testing-library/react";
import { KpiCard } from "./kpi-card";

describe("KpiCard", () => {
  it("affiche le label, la valeur et le delta avec la tendance", () => {
    render(<KpiCard label="Visiteurs" value="2 480" trend="up" delta="+14 %" />);
    expect(screen.getByText("2 480")).toBeInTheDocument();
    expect(screen.getByText(/\+14 %/)).toHaveAttribute("data-trend", "up");
  });
});
