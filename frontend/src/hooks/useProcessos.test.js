import { renderHook, act, waitFor } from "@testing-library/react";
import { useProcessos } from "./useProcessos";
import * as api from "../services/processoService";

jest.mock("../services/processoService");

describe("useProcessos", () => {
  afterEach(() => jest.resetAllMocks());

  test("carregarProcessos popula o estado processos", async () => {
    api.listarProcessos.mockResolvedValue([{ id: 1, numeroProcesso: "PE 1/2026" }]);
    const { result } = renderHook(() => useProcessos());

    await act(async () => { await result.current.carregarProcessos(); });

    expect(result.current.processos).toHaveLength(1);
    expect(result.current.erro).toBeNull();
  });

  test("carregarProcessos captura erro e popula `erro`", async () => {
    api.listarProcessos.mockRejectedValue(new Error("Falha ao listar"));
    const { result } = renderHook(() => useProcessos());

    await act(async () => { await result.current.carregarProcessos(); });

    expect(result.current.erro).toBe("Falha ao listar");
    expect(result.current.carregando).toBe(false);
  });

  test("carregarResumo popula o estado resumo", async () => {
    api.buscarResumo.mockResolvedValue({ totalGerenciadas: 3, totalFavoritas: 1 });
    const { result } = renderHook(() => useProcessos());

    await act(async () => { await result.current.carregarResumo(); });

    expect(result.current.resumo.totalGerenciadas).toBe(3);
  });

  test("criarProcesso adiciona o novo processo à lista", async () => {
    api.criarProcesso.mockResolvedValue({ id: 9, numeroProcesso: "PE 9/2026" });
    const { result } = renderHook(() => useProcessos());

    await act(async () => { await result.current.criarProcesso({ cliente: "X" }); });

    expect(result.current.processos).toHaveLength(1);
    expect(result.current.processos[0].id).toBe(9);
  });

  test("favoritar atualiza o processo correspondente na lista", async () => {
    api.listarProcessos.mockResolvedValue([{ id: 1, favorito: false }, { id: 2, favorito: false }]);
    api.favoritarProcesso.mockResolvedValue({ id: 1, favorito: true });
    const { result } = renderHook(() => useProcessos());

    await act(async () => { await result.current.carregarProcessos(); });
    await act(async () => { await result.current.favoritar(1, true); });

    expect(result.current.processos.find((p) => p.id === 1).favorito).toBe(true);
    expect(result.current.processos.find((p) => p.id === 2).favorito).toBe(false);
  });

  test("excluir remove o processo da lista", async () => {
    api.listarProcessos.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    api.excluirProcesso.mockResolvedValue(null);
    const { result } = renderHook(() => useProcessos());

    await act(async () => { await result.current.carregarProcessos(); });
    await act(async () => { await result.current.excluir(1); });

    expect(result.current.processos.map((p) => p.id)).toEqual([2]);
  });

  test("concluirEtapa recarrega o processo atualizado", async () => {
    api.listarProcessos.mockResolvedValue([{ id: 1, totalEtapas: 9, etapasConcluidas: 0 }]);
    api.concluirEtapa.mockResolvedValue({ id: 10, concluida: true });
    api.buscarProcesso.mockResolvedValue({ id: 1, totalEtapas: 9, etapasConcluidas: 1 });
    const { result } = renderHook(() => useProcessos());

    await act(async () => { await result.current.carregarProcessos(); });
    await act(async () => { await result.current.concluirEtapa(1, 10, true); });

    expect(result.current.processos[0].etapasConcluidas).toBe(1);
  });
});
