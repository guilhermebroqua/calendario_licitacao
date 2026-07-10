import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EtapaPainel from "./EtapaPainel";
import * as api from "../services/processoService";

jest.mock("../services/processoService");

const processo = { id: 1, numeroProcesso: "PE 045/2026", cliente: "Prefeitura X" };
const etapa = {
  id: 12, tipo: "PREPARAR_DOCUMENTACAO", label: "Preparar documentação",
  dataPrevista: "2026-08-10T09:00:00", concluida: false, aguardandoConvocacao: false, atrasada: false,
};

describe("EtapaPainel", () => {
  afterEach(() => jest.resetAllMocks());

  test("carrega e exibe anotações existentes", async () => {
    api.listarAnotacoes.mockResolvedValue([{ id: 1, autor: "Ana", texto: "Aguardando retorno do órgão", criadoEm: "2026-07-01T10:00:00" }]);

    render(<EtapaPainel processo={processo} etapa={etapa} onFechar={jest.fn()} onConcluir={jest.fn()} onReagendar={jest.fn()} />);

    expect(await screen.findByText("Aguardando retorno do órgão")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });

  test("exibe estado vazio quando não há anotações", async () => {
    api.listarAnotacoes.mockResolvedValue([]);
    render(<EtapaPainel processo={processo} etapa={etapa} onFechar={jest.fn()} onConcluir={jest.fn()} onReagendar={jest.fn()} />);
    expect(await screen.findByText("Nenhuma anotação ainda.")).toBeInTheDocument();
  });

  test("marcar checkbox de concluída dispara onConcluir", async () => {
    api.listarAnotacoes.mockResolvedValue([]);
    const onConcluir = jest.fn();
    render(<EtapaPainel processo={processo} etapa={etapa} onFechar={jest.fn()} onConcluir={onConcluir} onReagendar={jest.fn()} />);
    await screen.findByText("Nenhuma anotação ainda.");

    fireEvent.click(screen.getByLabelText("Marcar como concluída"));

    expect(onConcluir).toHaveBeenCalledWith(true);
  });

  test("adicionar anotação chama a API e insere na lista", async () => {
    api.listarAnotacoes.mockResolvedValue([]);
    api.adicionarAnotacao.mockResolvedValue({ id: 2, autor: "Bruno", texto: "Documentos protocolados" });

    render(<EtapaPainel processo={processo} etapa={etapa} onFechar={jest.fn()} onConcluir={jest.fn()} onReagendar={jest.fn()} />);
    await screen.findByText("Nenhuma anotação ainda.");

    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { value: "Bruno" } });
    fireEvent.change(screen.getByPlaceholderText(/Escreva uma anotação/), { target: { value: "Documentos protocolados" } });
    fireEvent.click(screen.getByText("Adicionar anotação"));

    expect(await screen.findByText("Documentos protocolados")).toBeInTheDocument();
    expect(api.adicionarAnotacao).toHaveBeenCalledWith(12, "Bruno", "Documentos protocolados");
  });

  test("botão fechar dispara onFechar", async () => {
    api.listarAnotacoes.mockResolvedValue([]);
    const onFechar = jest.fn();
    render(<EtapaPainel processo={processo} etapa={etapa} onFechar={onFechar} onConcluir={jest.fn()} onReagendar={jest.fn()} />);
    await screen.findByText("Nenhuma anotação ainda.");

    fireEvent.click(screen.getByText("✕"));

    expect(onFechar).toHaveBeenCalled();
  });

  test("etapa aguardando convocação usa rótulo específico de reagendamento", async () => {
    api.listarAnotacoes.mockResolvedValue([]);
    const etapaAguardando = { ...etapa, tipo: "PROPOSTA_AJUSTADA_RECURSO", dataPrevista: null, aguardandoConvocacao: true };
    render(<EtapaPainel processo={processo} etapa={etapaAguardando} onFechar={jest.fn()} onConcluir={jest.fn()} onReagendar={jest.fn()} />);
    expect(await screen.findByText(/Definir data \(após convocação do pregoeiro\)/)).toBeInTheDocument();
  });
});
