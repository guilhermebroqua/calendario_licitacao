import { render, screen, fireEvent } from "@testing-library/react";
import QuadroEtapas from "./QuadroEtapas";

jest.mock("../services/processoService", () => ({
  listarAnotacoes: jest.fn().mockResolvedValue([]),
  adicionarAnotacao: jest.fn(),
}));

function processoMock(overrides = {}) {
  return {
    id: 1,
    cliente: "Prefeitura de Exemplo",
    numeroProcesso: "PE 045/2026",
    favorito: false,
    status: "EM_ANDAMENTO",
    totalEtapas: 9,
    etapasConcluidas: 2,
    percentualConcluido: 22,
    etapas: [
      { id: 10, tipo: "RESUMO_EDITAL", label: "Resumo e/ou análise do edital", dataPrevista: "2026-07-01T09:00:00", concluida: true, aguardandoConvocacao: false, atrasada: false, hoje: false },
      { id: 11, tipo: "CADASTRO_SISTEMA", label: "Cadastro ou atualização no sistema", dataPrevista: "2026-07-01T09:00:00", concluida: true, aguardandoConvocacao: false, atrasada: false, hoje: false },
      { id: 12, tipo: "PREPARAR_DOCUMENTACAO", label: "Preparar documentação", dataPrevista: "2026-08-10T09:00:00", concluida: false, aguardandoConvocacao: false, atrasada: false, hoje: false },
      { id: 13, tipo: "PEDIDO_ESCLARECIMENTO_IMPUGNACAO", label: "Pedido de esclarecimentos ou impugnação", dataPrevista: "2026-08-13T09:00:00", concluida: false, aguardandoConvocacao: false, atrasada: false, hoje: false },
      { id: 14, tipo: "REGISTRAR_PROPOSTA_PRECOS", label: "Registrar proposta de preços", dataPrevista: "2026-08-17T09:00:00", concluida: false, aguardandoConvocacao: false, atrasada: false, hoje: false },
      { id: 15, tipo: "DEFINIR_VALOR_MINIMO_LANCE", label: "Definir valor mínimo do lance", dataPrevista: "2026-08-17T09:00:00", concluida: false, aguardandoConvocacao: false, atrasada: false, hoje: false },
      { id: 16, tipo: "DATA_ABERTURA_SESSAO", label: "Data de abertura e realização da sessão", dataPrevista: "2026-08-18T09:00:00", concluida: false, aguardandoConvocacao: false, atrasada: false, hoje: false },
      { id: 17, tipo: "SESSAO_LANCES_CHAT", label: "Sessão de lances e acompanhamento de chat", dataPrevista: "2026-08-18T09:00:00", concluida: false, aguardandoConvocacao: false, atrasada: false, hoje: false },
      { id: 18, tipo: "PROPOSTA_AJUSTADA_RECURSO", label: "Proposta ajustada", dataPrevista: null, concluida: false, aguardandoConvocacao: true, atrasada: false, hoje: false },
    ],
    ...overrides,
  };
}

const handlers = {
  onFavoritar: jest.fn(),
  onFinalizar: jest.fn(),
  onExcluir: jest.fn(),
  onConcluirEtapa: jest.fn(),
  onReagendarEtapa: jest.fn(),
  onNovoProcesso: jest.fn(),
};

describe("QuadroEtapas", () => {
  afterEach(() => jest.clearAllMocks());

  test("renderiza uma coluna para cada uma das 9 etapas padrão", () => {
    render(<QuadroEtapas processos={[processoMock()]} carregando={false} {...handlers} />);
    expect(screen.getByText("Resumo do edital")).toBeInTheDocument();
    expect(screen.getByText("Cadastro/atualização")).toBeInTheDocument();
    expect(screen.getByText("Preparar documentação")).toBeInTheDocument();
    expect(screen.getByText("Esclarecimento/impugnação")).toBeInTheDocument();
    expect(screen.getByText("Registrar proposta")).toBeInTheDocument();
    expect(screen.getByText("Valor mínimo do lance")).toBeInTheDocument();
    expect(screen.getByText("Abertura da sessão")).toBeInTheDocument();
    expect(screen.getByText("Sessão de lances/chat")).toBeInTheDocument();
    expect(screen.getByText("Proposta ajustada/recurso")).toBeInTheDocument();
  });

  test("renderiza a linha do processo com número e cliente", () => {
    render(<QuadroEtapas processos={[processoMock()]} carregando={false} {...handlers} />);
    expect(screen.getByText("PE 045/2026")).toBeInTheDocument();
    expect(screen.getByText("Prefeitura de Exemplo")).toBeInTheDocument();
    expect(screen.getByText("2/9 etapas")).toBeInTheDocument();
  });

  test("etapa aguardando convocação exibe 'A DEF.'", () => {
    render(<QuadroEtapas processos={[processoMock()]} carregando={false} {...handlers} />);
    expect(screen.getByText("A DEF.")).toBeInTheDocument();
  });

  test("mostra mensagem vazia quando não há processos", () => {
    render(<QuadroEtapas processos={[]} carregando={false} {...handlers} />);
    expect(screen.getByText(/Nenhum processo licitatório/)).toBeInTheDocument();
  });

  test("botão Novo processo dispara onNovoProcesso", () => {
    render(<QuadroEtapas processos={[]} carregando={false} {...handlers} />);
    fireEvent.click(screen.getByText("+ Novo processo"));
    expect(handlers.onNovoProcesso).toHaveBeenCalled();
  });

  test("marcar checkbox de etapa dispara onConcluirEtapa com valor invertido", () => {
    render(<QuadroEtapas processos={[processoMock()]} carregando={false} {...handlers} />);
    const celula = screen.getByTestId("celula-PREPARAR_DOCUMENTACAO-1");
    const checkbox = celula.querySelector("input[type=checkbox]");
    fireEvent.click(checkbox);
    expect(handlers.onConcluirEtapa).toHaveBeenCalledWith(1, 12, true);
  });

  test("filtro CONCLUIDAS esconde processos sem etapas concluídas", () => {
    const semConcluidas = processoMock({
      id: 2, numeroProcesso: "PE 099/2026",
      etapas: processoMock().etapas.map((e) => ({ ...e, concluida: false })),
    });
    render(<QuadroEtapas processos={[processoMock(), semConcluidas]} carregando={false} {...handlers} />);

    fireEvent.click(screen.getByText("Concluídas"));

    expect(screen.getByText("PE 045/2026")).toBeInTheDocument();
    expect(screen.queryByText("PE 099/2026")).not.toBeInTheDocument();
  });

  test("botão favoritar dispara onFavoritar com valor invertido", () => {
    render(<QuadroEtapas processos={[processoMock()]} carregando={false} {...handlers} />);
    fireEvent.click(screen.getByTitle("Favoritar"));
    expect(handlers.onFavoritar).toHaveBeenCalledWith(1, true);
  });

  test("botão excluir dispara onExcluir", () => {
    render(<QuadroEtapas processos={[processoMock()]} carregando={false} {...handlers} />);
    fireEvent.click(screen.getByTitle("Excluir"));
    expect(handlers.onExcluir).toHaveBeenCalledWith(1);
  });
});
