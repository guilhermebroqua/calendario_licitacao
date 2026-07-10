import * as api from "./relatorioService";

function mockFetchOnce(status, body) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe("relatorioService", () => {
  afterEach(() => jest.resetAllMocks());

  test("relatorioDiario sem data chama endpoint sem querystring", async () => {
    mockFetchOnce(200, { tipo: "DIARIO", itens: [] });
    await api.relatorioDiario();
    const [url] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/relatorios/diario");
  });

  test("relatorioDiario com data adiciona querystring", async () => {
    mockFetchOnce(200, { tipo: "DIARIO", itens: [] });
    await api.relatorioDiario("2026-07-08");
    const [url] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/relatorios/diario?data=2026-07-08");
  });

  test("relatorioCompleto com processoId adiciona querystring", async () => {
    mockFetchOnce(200, { tipo: "COMPLETO", itens: [] });
    await api.relatorioCompleto(7);
    const [url] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/relatorios/completo?processoId=7");
  });

  test("urlCsv monta a URL de exportação corretamente", () => {
    expect(api.urlCsv("diario")).toBe("/api/relatorios/diario/csv");
    expect(api.urlCsv("completo", { processoId: 3 })).toBe("/api/relatorios/completo/csv?processoId=3");
  });

  test("lança erro com mensagem do backend em falha", async () => {
    mockFetchOnce(500, { mensagem: "Erro interno" });
    await expect(api.relatorioSemanal()).rejects.toThrow("Erro interno");
  });
});
