import { useState, useCallback } from "react";
import * as api from "../services/eventoService";

export function useEventos() {
  const [eventos, setEventos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarMes = useCallback(async (ano, mes) => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await api.listarEventos(ano, mes);
      setEventos(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarAlertas = useCallback(async (dias = 7) => {
    try {
      const data = await api.buscarAlertas(dias);
      setAlertas(data);
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  const criar = useCallback(async (dto) => {
    setErro(null);
    const novo = await api.criarEvento(dto);
    setEventos((prev) => [...prev, novo]);
    return novo;
  }, []);

  const editar = useCallback(async (id, dto) => {
    setErro(null);
    const atualizado = await api.editarEvento(id, dto);
    setEventos((prev) => prev.map((e) => (e.id === id ? atualizado : e)));
    return atualizado;
  }, []);

  const excluir = useCallback(async (id, justificativa) => {
    setErro(null);
    await api.excluirEvento(id, justificativa);
    setEventos((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const checarConflitos = useCallback(async (dto) => {
    return api.verificarConflitos(dto);
  }, []);

  return {
    eventos,
    alertas,
    carregando,
    erro,
    carregarMes,
    carregarAlertas,
    criar,
    editar,
    excluir,
    checarConflitos,
  };
}
