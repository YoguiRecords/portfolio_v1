import { render, screen } from "@testing-library/react";
import { DataTable, type Column } from "./data-table";

type Row = { id: string; name: string };

const cols: Column<Row>[] = [{ key: "name", header: "Nom", render: (r) => r.name }];
const rows: Row[] = [{ id: "1", name: "Domestic Revolt" }];

describe("DataTable", () => {
  it("rend les en-têtes et les lignes", () => {
    render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />);
    expect(screen.getByText("Nom")).toBeInTheDocument();
    expect(screen.getByText("Domestic Revolt")).toBeInTheDocument();
  });

  it("affiche l'état vide quand rows est vide", () => {
    render(<DataTable columns={cols} rows={[]} rowKey={(r) => r.id} emptyLabel="Aucun projet" />);
    expect(screen.getByText("Aucun projet")).toBeInTheDocument();
  });

  it("rend les actions de ligne", () => {
    render(
      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(r) => r.id}
        rowActions={() => <button type="button">Éditer</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Éditer" })).toBeInTheDocument();
  });
});
