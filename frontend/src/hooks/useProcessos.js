import { useState, useCallback } from "react";
import * as api from "../services/processoService";

export function useProcessos() {
  const [processos, setProcessos] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarProcessos = useCallback(async (filtros) => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await api.listarProcessos(filtros);
      setProcessos(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarResumo = useCallback(async () => {
    try {
      const data = await api.buscarResumo();
      setResumo(data);
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  const criarProcesso = useCallback(async (dto) => {
    setErro(null);
    const novo = await api.criarProcesso(dto);
    setProcessos((prev) => [...prev, novo]);
    return novo;
  }, []);

  const favoritar = useCallback(async (id, favorito) => {
    const atualizado = await api.favoritarProcesso(id, favorito);
    setProcessos((prev) => prev.map((p) => (p.id === id ? atualizado : p)));
    return atualizado;
  }, []);

  const finalizar = useCallback(async (id) => {
    const atualizado = await api.finalizarProcesso(id);
    setProcessos((prev) => prev.map((p) => (p.id === id ? atualizado : p)));
    return atualizado;
  }, []);

  const excluir = useCallback(async (id) => {
    await api.excluirProcesso(id);
    setProcessos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const concluirEtapa = useCallback(async (processoId, etapaId, concluida) => {
    await api.concluirEtapa(etapaId, concluida);
    const atualizado = await api.buscarProcesso(processoId);
    setProcessos((prev) => prev.map((p) => (p.id === processoId ? atualizado : p)));
    return atualizado;
  }, []);

  const reagendarEtapa = useCallback(async (processoId, etapaId, novaData) => {
    await api.reagendarEtapa(etapaId, novaData);
    const atualizado = await api.buscarProcesso(processoId);
    setProcessos((prev) => prev.map((p) => (p.id === processoId ? atualizado : p)));
    return atualizado;
  }, []);

  const sincronizar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const importados = await api.sincronizarProcessos();
      await carregarProcessos();
      await carregarResumo();
      return importados;
    } catch (e) {
      setErro(e.message);
      throw e;
    } finally {
      setCarregando(false);
    }
  }, [carregarProcessos, carregarResumo]);

  return {
    processos,
    resumo,
    carregando,
    erro,
    carregarProcessos,
    carregarResumo,
    criarProcesso,
    favoritar,
    finalizar,
    excluir,
    concluirEtapa,
    reagendarEtapa,
    sincronizar,
  };
}
