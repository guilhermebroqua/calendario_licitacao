import { useEffect, useState } from "react";
import { relatorioDiario, relatorioSemanal, relatorioCompleto, urlCsv } from "../services/relatorioService";
import { color, font } from "../styles/tokens";

const TIPOS = [
  { valor: "diario", label: "Diário" },
  { valor: "semanal", label: "Semanal" },
  { valor: "completo", label: "Todas as etapas" },
];

function fmtData(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function RelatoriosView() {
  const [tipo, setTipo] = useState("diario");
  const [relatorio, setRelatorio] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    const chamada = tipo === "diario" ? relatorioDiario : tipo === "semanal" ? relatorioSemanal : relatorioCompleto;
    chamada()
      .then((data) => { if (ativo) setRelatorio(data); })
      .catch((e) => { if (ativo) setErro(e.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tipo]);

  const itensPorProcesso = {};
  (relatorio?.itens ?? []).forEach((item) => {
    const chave = `${item.numeroProcesso}__${item.cliente}`;
    if (!itensPorProcesso[chave]) itensPorProcesso[chave] = { numeroProcesso: item.numeroProcesso, cliente: item.cliente, itens: [] };
    itensPorProcesso[chave].itens.push(item);
  });

  return (
    <div style={s.wrapper} data-testid="relatorios-view">
      <div style={s.toolbar}>
        <div style={s.abas}>
          {TIPOS.map((t) => (
            <button key={t.valor} style={{ ...s.aba, ...(tipo === t.valor ? s.abaAtiva : {}) }} onClick={() => setTipo(t.valor)}>
              {t.label}
            </button>
          ))}
        </div>
        <a style={s.btnCsv} href={urlCsv(tipo)} download>Exportar CSV</a>
      </div>

      {carregando && <div style={s.vazio}>Gerando relatório…</div>}
      {erro && <div style={s.erro}>{erro}</div>}

      {!carregando && relatorio && (
        <>
          <div style={s.resumo}>
            <ResumoItem label="Período" valor={`${relatorio.periodoInicio ?? "—"} a ${relatorio.periodoFim ?? "—"}`} mono />
            <ResumoItem label="Total de etapas" valor={relatorio.totalItens} />
            <ResumoItem label="Concluídas" valor={relatorio.totalConcluidos} cor={color.selo} />
            <ResumoItem label="Atrasadas" valor={relatorio.totalAtrasados} cor={color.carimbo} />
          </div>

          {Object.values(itensPorProcesso).length === 0 && (
            <div style={s.vazio}>Nenhuma etapa prevista neste período.</div>
          )}

          {Object.values(itensPorProcesso).map((grupo) => (
            <div key={grupo.numeroProcesso + grupo.cliente} style={s.card}>
              <div style={s.cardHead}>{grupo.numeroProcesso} — {grupo.cliente}</div>
              {grupo.itens.map((item, i) => (
                <div key={i} style={s.linha}>
                  <span style={s.linhaEtapa}>{item.labelEtapa}</span>
                  <span style={s.linhaData}>{fmtData(item.dataPrevista)}</span>
                  <span style={{
                    ...s.badge,
                    background: item.concluida ? color.seloSoft : item.atrasada ? color.carimboSoft : color.paper,
                    color: item.concluida ? color.selo : item.atrasada ? color.carimbo : color.grafite,
                  }}>
                    {item.concluida ? "Concluída" : item.atrasada ? "Atrasada" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function ResumoItem({ label, valor, cor, mono }) {
  return (
    <div style={s.resumoItem}>
      <div style={{ ...s.resumoValor, color: cor || color.ink, fontFamily: mono ? font.mono : font.mono, fontSize: mono ? 13 : 22 }}>{valor}</div>
      <div style={s.resumoLabel}>{label}</div>
    </div>
  );
}

const s = {
  wrapper: { display: "flex", flexDirection: "column", gap: 16 },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  abas: { display: "flex", gap: 6 },
  aba: { padding: "7px 15px", borderRadius: 7, border: `1px solid ${color.paperLine}`, background: color.paper, color: color.grafite, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  abaAtiva: { background: color.ink, color: "#F4F1E8", border: `1px solid ${color.ink}` },
  btnCsv: { padding: "7px 15px", borderRadius: 7, border: `1px solid ${color.paperLine}`, background: color.paperRaised, color: color.ink, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "none" },
  vazio: { padding: 32, textAlign: "center", color: color.grafiteLight, fontSize: 13, background: color.paperRaised, borderRadius: 10, border: `1px solid ${color.paperLine}` },
  erro: { padding: "10px 14px", background: color.carimboSoft, color: color.carimbo, borderRadius: 8, fontSize: 13 },
  resumo: { display: "flex", gap: 12 },
  resumoItem: { flex: 1, background: color.paperRaised, borderRadius: 10, border: `1px solid ${color.paperLine}`, padding: "12px 16px" },
  resumoValor: { fontWeight: 600 },
  resumoLabel: { fontSize: 11, color: color.grafiteLight, marginTop: 3 },
  card: { background: color.paperRaised, borderRadius: 10, border: `1px solid ${color.paperLine}`, overflow: "hidden" },
  cardHead: { padding: "11px 16px", fontSize: 13, fontWeight: 700, color: color.ink, borderBottom: `1px solid ${color.paper}`, background: color.paper },
  linha: { display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", borderBottom: `1px solid ${color.paper}`, fontSize: 12 },
  linhaEtapa: { flex: 1, color: color.ink },
  linhaData: { color: color.grafiteLight, fontSize: 11, fontFamily: font.mono },
  badge: { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 },
};
