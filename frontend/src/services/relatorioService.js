
const BASE_URL = "/api/relatorios";

async function request(path) {
  const res = await fetch(BASE_URL + path);
  if (!res.ok) {
    const erro = await res.json().catch(() => ({ mensagem: "Erro desconhecido" }));
    throw new Error(erro.mensagem || `Erro ${res.status}`);
  }
  return res.json();
}

export function relatorioDiario(data) {
  return request(`/diario${data ? `?data=${data}` : ""}`);
}

export function relatorioSemanal(data) {
  return request(`/semanal${data ? `?data=${data}` : ""}`);
}

export function relatorioCompleto(processoId) {
  return request(`/completo${processoId ? `?processoId=${processoId}` : ""}`);
}

export function urlCsv(tipo, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return `${BASE_URL}/${tipo}/csv${qs ? `?${qs}` : ""}`;
}
