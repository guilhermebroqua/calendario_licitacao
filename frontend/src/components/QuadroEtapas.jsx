import { useState } from "react";
import EtapaPainel from "./EtapaPainel";
import { color, font } from "../styles/tokens";

const ORDEM_TIPOS = [
  "RESUMO_EDITAL",
  "CADASTRO_SISTEMA",
  "PREPARAR_DOCUMENTACAO",
  "PEDIDO_ESCLARECIMENTO_IMPUGNACAO",
  "REGISTRAR_PROPOSTA_PRECOS",
  "DEFINIR_VALOR_MINIMO_LANCE",
  "DATA_ABERTURA_SESSAO",
  "SESSAO_LANCES_CHAT",
  "PROPOSTA_AJUSTADA_RECURSO",
];

const LABEL_CURTO = {
  RESUMO_EDITAL: "Resumo do edital",
  CADASTRO_SISTEMA: "Cadastro/atualização",
  PREPARAR_DOCUMENTACAO: "Preparar documentação",
  PEDIDO_ESCLARECIMENTO_IMPUGNACAO: "Esclarecimento/impugnação",
  REGISTRAR_PROPOSTA_PRECOS: "Registrar proposta",
  DEFINIR_VALOR_MINIMO_LANCE: "Valor mínimo do lance",
  DATA_ABERTURA_SESSAO: "Abertura da sessão",
  SESSAO_LANCES_CHAT: "Sessão de lances/chat",
  PROPOSTA_AJUSTADA_RECURSO: "Proposta ajustada/recurso",
};

const FILTROS = [
  { valor: "TODAS", label: "Todas" },
  { valor: "HOJE", label: "Hoje" },
  { valor: "ATRASADAS", label: "Atrasadas" },
  { valor: "CONCLUIDAS", label: "Concluídas" },
];

function fmtCurta(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function etapaPorTipo(processo, tipo) {
  return processo.etapas?.find((e) => e.tipo === tipo) ?? null;
}

function processoTemNoFiltro(processo, filtro) {
  if (filtro === "TODAS") return true;
  return processo.etapas?.some((e) => {
    if (filtro === "HOJE") return e.hoje;
    if (filtro === "ATRASADAS") return e.atrasada;
    if (filtro === "CONCLUIDAS") return e.concluida;
    return true;
  });
}

export default function QuadroEtapas({ processos, carregando, onFavoritar, onFinalizar, onExcluir, onConcluirEtapa, onReagendarEtapa, onNovoProcesso }) {
  const [filtro, setFiltro] = useState("TODAS");
  const [selecao, setSelecao] = useState(null);

  const processosFiltrados = processos.filter((p) => processoTemNoFiltro(p, filtro));

  const processoSelecionado = selecao ? processos.find((p) => p.id === selecao.processoId) : null;
  const etapaSelecionadaAtual = processoSelecionado?.etapas?.find((e) => e.id === selecao.etapaId);

  return (
    <div style={s.wrapper} data-testid="quadro-etapas">
      <div style={s.toolbar}>
        <div style={s.filtros}>
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              style={{ ...s.chip, ...(filtro === f.valor ? s.chipAtivo : {}) }}
              onClick={() => setFiltro(f.valor)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button style={s.btnNovo} onClick={onNovoProcesso}>+ Novo processo</button>
      </div>

      {carregando && <div style={s.vazio}>Carregando…</div>}

      {!carregando && processosFiltrados.length === 0 && (
        <div style={s.vazio}>Nenhum processo licitatório no filtro selecionado.</div>
      )}

      {!carregando && processosFiltrados.length > 0 && (
        <div style={s.scrollWrapper}>
          <table style={s.tabela}>
            <thead>
              <tr>
                <th style={s.thCliente}>Cliente / Edital</th>
                {ORDEM_TIPOS.map((tipo) => (
                  <th key={tipo} style={s.th}>{LABEL_CURTO[tipo]}</th>
                ))}
                <th style={s.thAcoes}></th>
              </tr>
            </thead>
            <tbody>
              {processosFiltrados.map((processo) => (
                <tr key={processo.id} data-testid={`linha-processo-${processo.id}`}>
                  <td style={s.tdCliente}>
                    <div style={s.clienteNome}>
                      {processo.favorito && <span title="Favorito" style={{ color: color.brasaoDeep }}>★</span>} {processo.numeroProcesso}
                    </div>
                    <div style={s.clienteSub}>{processo.cliente}</div>
                    <div style={s.progresso}>
                      <div style={{ ...s.progressoBarra, width: `${processo.percentualConcluido}%` }} />
                    </div>
                    <span style={s.progressoTexto}>{processo.etapasConcluidas}/{processo.totalEtapas} etapas</span>
                  </td>
                  {ORDEM_TIPOS.map((tipo) => {
                    const etapa = etapaPorTipo(processo, tipo);
                    if (!etapa) return <td key={tipo} style={s.td}>—</td>;
                    const destaque = filtro !== "TODAS" && (
                      (filtro === "HOJE" && etapa.hoje) ||
                      (filtro === "ATRASADAS" && etapa.atrasada) ||
                      (filtro === "CONCLUIDAS" && etapa.concluida)
                    );
                    return (
                      <td
                        key={tipo}
                        style={{ ...s.td, ...(destaque ? s.tdDestaque : {}) }}
                        data-testid={`celula-${tipo}-${processo.id}`}
                        onClick={() => setSelecao({ processoId: processo.id, etapaId: etapa.id })}
                      >
                        <label className="stamp-cell" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="stamp-checkbox"
                            checked={etapa.concluida}
                            onChange={() => onConcluirEtapa(processo.id, etapa.id, !etapa.concluida)}
                          />
                          <span
                            className={
                              "stamp-mark" +
                              (etapa.atrasada ? " is-atrasada" : "") +
                              (etapa.aguardandoConvocacao ? " is-aguardando" : "")
                            }
                          >
                            {etapa.aguardandoConvocacao ? "A DEF." : fmtCurta(etapa.dataPrevista)}
                          </span>
                        </label>
                      </td>
                    );
                  })}
                  <td style={s.tdAcoes}>
                    <button style={s.btnIcone} title="Favoritar" onClick={() => onFavoritar(processo.id, !processo.favorito)}>
                      {processo.favorito ? "★" : "☆"}
                    </button>
                    <button style={s.btnIcone} title="Finalizar" onClick={() => onFinalizar(processo.id)}>✓</button>
                    <button style={{ ...s.btnIcone, color: color.carimbo }} title="Excluir" onClick={() => onExcluir(processo.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {processoSelecionado && etapaSelecionadaAtual && (
        <EtapaPainel
          processo={processoSelecionado}
          etapa={etapaSelecionadaAtual}
          onFechar={() => setSelecao(null)}
          onConcluir={(concluida) => onConcluirEtapa(processoSelecionado.id, etapaSelecionadaAtual.id, concluida)}
          onReagendar={(novaData) => onReagendarEtapa(processoSelecionado.id, etapaSelecionadaAtual.id, novaData)}
        />
      )}
    </div>
  );
}

const s = {
  wrapper: { display: "flex", flexDirection: "column", gap: 14 },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  filtros: { display: "flex", gap: 6 },
  chip: { padding: "6px 13px", borderRadius: 99, border: `1px solid ${color.paperLine}`, background: color.paper, color: color.grafite, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  chipAtivo: { background: color.ink, color: "#F4F1E8", border: `1px solid ${color.ink}` },
  btnNovo: { padding: "9px 18px", background: color.brasaoDeep, color: "#FCF7EE", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  vazio: { padding: 32, textAlign: "center", color: color.grafiteLight, fontSize: 13, background: color.paperRaised, borderRadius: 10, border: `1px solid ${color.paperLine}` },
  scrollWrapper: { overflowX: "auto", background: color.paperRaised, borderRadius: 10, border: `1px solid ${color.paperLine}` },
  tabela: { borderCollapse: "collapse", width: "100%", fontSize: 12 },
  th: { padding: "11px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: color.grafite, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${color.paperLine}`, whiteSpace: "nowrap", background: color.paper },
  thCliente: { padding: "11px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: color.grafite, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${color.paperLine}`, minWidth: 200, background: color.paper },
  thAcoes: { borderBottom: `1px solid ${color.paperLine}`, background: color.paper },
  td: { padding: "10px 8px", textAlign: "center", borderBottom: `1px solid ${color.paper}`, cursor: "pointer", minWidth: 90 },
  tdCliente: { padding: "10px 14px", borderBottom: `1px solid ${color.paper}` },
  tdDestaque: { boxShadow: `inset 0 0 0 2px ${color.ferro}` },
  tdAcoes: { padding: "8px 10px", borderBottom: `1px solid ${color.paper}`, whiteSpace: "nowrap" },
  btnIcone: { background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 4px", color: color.grafiteLight },
  clienteNome: { fontWeight: 700, fontSize: 12.5, color: color.ink, fontFamily: font.mono },
  clienteSub: { fontSize: 11, color: color.grafite, marginTop: 1 },
  progresso: { height: 4, background: color.paper, borderRadius: 99, overflow: "hidden", marginTop: 7, width: 140 },
  progressoBarra: { height: "100%", background: color.selo },
  progressoTexto: { fontSize: 10, color: color.grafiteLight, fontFamily: font.mono },
};
