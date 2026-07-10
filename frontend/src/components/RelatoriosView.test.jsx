import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RelatoriosView from "./RelatoriosView";
import * as api from "../services/relatorioService";

jest.mock("../services/relatorioService");

const relatorioMock = {
  tipo: "DIARIO",
  periodoInicio: "2026-07-08",
  periodoFim: "2026-07-08",
  totalItens: 2,
  totalConcluidos: 1,
  totalAtrasados: 1,
  itens: [
    { processoId: 1, cliente: "Prefeitura X", numeroProcesso: "PE 045/2026", labelEtapa: "Preparar documentação", dataPrevista: "2026-07-08T09:00:00", concluida: true, atrasada: false },
    { processoId: 1, cliente: "Prefeitura X", numeroProcesso: "PE 045/2026", labelEtapa: "Pedido de esclarecimentos", dataPrevista: "2026-07-08T10:00:00", concluida: false, atrasada: true },
  ],
};

describe("RelatoriosView", () => {
  beforeEach(() => {
    api.relatorioDiario.mockResolvedValue(relatorioMock);
    api.relatorioSemanal.mockResolvedValue({ ...relatorioMock, tipo: "SEMANAL" });
    api.relatorioCompleto.mockResolvedValue({ ...relatorioMock, tipo: "COMPLETO" });
    api.urlCsv.mockReturnValue("/api/relatorios/diario/csv");
  });
  afterEach(() => jest.resetAllMocks());

  test("carrega e exibe o relatório diário por padrão", async () => {
    render(<RelatoriosView />);
    expect(await screen.findByText("PE 045/2026 — Prefeitura X")).toBeInTheDocument();
    expect(screen.getByText("Preparar documentação")).toBeInTheDocument();
    expect(api.relatorioDiario).toHaveBeenCalled();
  });

  test("exibe os contadores de totais", async () => {
    render(<RelatoriosView />);
    await screen.findByText("PE 045/2026 — Prefeitura X");
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Concluídas")).toBeInTheDocument();
    expect(screen.getByText("Atrasadas")).toBeInTheDocument();
  });

  test("troca para relatório semanal ao clicar na aba", async () => {
    render(<RelatoriosView />);
    await screen.findByText("PE 045/2026 — Prefeitura X");

    fireEvent.click(screen.getByText("Semanal"));

    await waitFor(() => expect(api.relatorioSemanal).toHaveBeenCalled());
  });

  test("troca para relatório completo ao clicar na aba", async () => {
    render(<RelatoriosView />);
    await screen.findByText("PE 045/2026 — Prefeitura X");

    fireEvent.click(screen.getByText("Todas as etapas"));

    await waitFor(() => expect(api.relatorioCompleto).toHaveBeenCalled());
  });

  test("exibe mensagem de erro quando a chamada falha", async () => {
    api.relatorioDiario.mockRejectedValue(new Error("Falha ao gerar relatório"));
    render(<RelatoriosView />);
    expect(await screen.findByText("Falha ao gerar relatório")).toBeInTheDocument();
  });

  test("link de exportação CSV aponta para a URL correta", async () => {
    render(<RelatoriosView />);
    await screen.findByText("PE 045/2026 — Prefeitura X");
    expect(screen.getByText("Exportar CSV").closest("a")).toHaveAttribute("href", "/api/relatorios/diario/csv");
  });
});
