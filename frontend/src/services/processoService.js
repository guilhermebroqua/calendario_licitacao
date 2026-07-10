
const BASE_URL = "/api/processos";

async function request(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const erro = await res.json().catch(() => ({ mensagem: "Erro desconhecido" }));
    throw new Error(erro.mensagem || `Erro ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function listarProcessos({ status, favorito } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (favorito !== undefined) params.set("favorito", favorito);
  const qs = params.toString();
  return request(qs ? `?${qs}` : "");
}

export function buscarResumo() {
  return request("/resumo");
}

export function buscarProcesso(id) {
  return request(`/${id}`);
}

export function criarProcesso(dto) {
  return request("", { method: "POST", body: JSON.stringify(dto) });
}

export function favoritarProcesso(id, favorito) {
  return request(`/${id}/favorito`, { method: "PUT", body: JSON.stringify({ favorito }) });
}

export function finalizarProcesso(id) {
  return request(`/${id}/finalizar`, { method: "PUT" });
}

export function excluirProcesso(id) {
  return request(`/${id}`, { method: "DELETE" });
}

export function sincronizarProcessos() {
  return request("/sincronizar", { method: "POST" });
}

export function listarEtapas(processoId, filtro = "TODAS") {
  return request(`/${processoId}/etapas?filtro=${filtro}`);
}

export function listarTodasEtapas(filtro = "TODAS") {
  return request(`/etapas?filtro=${filtro}`);
}

export function concluirEtapa(etapaId, concluida = true) {
  return request(`/etapas/${etapaId}/concluir`, { method: "PUT", body: JSON.stringify({ concluida }) });
}

export function reagendarEtapa(etapaId, novaData) {
  return request(`/etapas/${etapaId}/reagendar`, { method: "PUT", body: JSON.stringify({ novaData }) });
}

export function adicionarAnotacao(etapaId, autor, texto) {
  return request(`/etapas/${etapaId}/anotacoes`, { method: "POST", body: JSON.stringify({ autor, texto }) });
}

export function listarAnotacoes(etapaId) {
  return request(`/etapas/${etapaId}/anotacoes`);
}
