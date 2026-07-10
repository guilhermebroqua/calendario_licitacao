import * as api from "./processoService";

function mockFetchOnce(status, body) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe("processoService", () => {
  afterEach(() => jest.resetAllMocks());

  test("listarProcessos monta querystring com status e favorito", async () => {
    mockFetchOnce(200, []);
    await api.listarProcessos({ status: "EM_ANDAMENTO", favorito: true });
    const [url] = global.fetch.mock.calls[0];
    expect(url).toContain("status=EM_ANDAMENTO");
    expect(url).toContain("favorito=true");
  });

  test("listarProcessos sem filtros não adiciona querystring", async () => {
    mockFetchOnce(200, []);
    await api.listarProcessos();
    const [url] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/processos");
  });

  test("criarProcesso envia POST com corpo JSON", async () => {
    const dto = { cliente: "X", numeroProcesso: "PE 1/2026" };
    mockFetchOnce(201, { id: 1, ...dto });
    const resultado = await api.criarProcesso(dto);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/processos");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual(dto);
    expect(resultado.id).toBe(1);
  });

  test("favoritarProcesso envia PUT para /{id}/favorito", async () => {
    mockFetchOnce(200, { id: 5, favorito: true });
    await api.favoritarProcesso(5, true);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/processos/5/favorito");
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body)).toEqual({ favorito: true });
  });

  test("concluirEtapa envia PUT para /etapas/{id}/concluir", async () => {
    mockFetchOnce(200, { id: 9, concluida: true });
    await api.concluirEtapa(9, true);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/processos/etapas/9/concluir");
    expect(JSON.parse(options.body)).toEqual({ concluida: true });
  });

  test("lança erro com mensagem do backend quando resposta não é ok", async () => {
    mockFetchOnce(400, { mensagem: "O cliente/órgão é obrigatório" });
    await expect(api.criarProcesso({})).rejects.toThrow("O cliente/órgão é obrigatório");
  });

  test("excluirProcesso retorna null em 204 No Content", async () => {
    mockFetchOnce(204, null);
    const resultado = await api.excluirProcesso(1);
    expect(resultado).toBeNull();
  });

  test("listarEtapas usa filtro TODAS por padrão", async () => {
    mockFetchOnce(200, []);
    await api.listarEtapas(3);
    const [url] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/processos/3/etapas?filtro=TODAS");
  });
});
