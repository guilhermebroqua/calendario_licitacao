
const BASE_URL = "/api/eventos";

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

export function listarEventos(ano, mes) {
  return request(`?ano=${ano}&mes=${mes}`);
}

export function criarEvento(dto) {
  return request("", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function editarEvento(id, dto) {
  return request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function excluirEvento(id, justificativa) {
  const query = justificativa ? `?justificativa=${encodeURIComponent(justificativa)}` : "";
  return request(`/${id}${query}`, { method: "DELETE" });
}

export function buscarAlertas(dias = 7) {
  return request(`/alertas?dias=${dias}`);
}

export function verificarConflitos(dto) {
  return request("/conflitos", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
