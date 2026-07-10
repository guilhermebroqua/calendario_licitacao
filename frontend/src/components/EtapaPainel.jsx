import { useEffect, useState } from "react";
import { adicionarAnotacao, listarAnotacoes } from "../services/processoService";
import { color, font } from "../styles/tokens";

function fmt(iso) {
  if (!iso) return "A definir — aguardando convocação do pregoeiro";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function EtapaPainel({ processo, etapa, onFechar, onConcluir, onReagendar }) {
  const [anotacoes, setAnotacoes] = useState([]);
  const [carregandoAnotacoes, setCarregandoAnotacoes] = useState(true);
  const [autor, setAutor] = useState("");
  const [texto, setTexto] = useState("");
  const [novaData, setNovaData] = useState(etapa.dataPrevista ? etapa.dataPrevista.slice(0, 16) : "");
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    setCarregandoAnotacoes(true);
    listarAnotacoes(etapa.id)
      .then((data) => { if (ativo) setAnotacoes(data); })
      .catch((e) => { if (ativo) setErro(e.message); })
      .finally(() => { if (ativo) setCarregandoAnotacoes(false); });
    return () => { ativo = false; };
  }, [etapa.id]);

  async function handleAdicionarAnotacao(e) {
    e.preventDefault();
    if (!autor.trim() || !texto.trim()) return;
    try {
      const nova = await adicionarAnotacao(etapa.id, autor.trim(), texto.trim());
      setAnotacoes((prev) => [...prev, nova]);
      setTexto("");
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleReagendar(e) {
    e.preventDefault();
    if (!novaData) return;
    try {
      await onReagendar(novaData + (novaData.length === 16 ? ":00" : ""));
      onFechar();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div style={s.painel} data-testid="etapa-painel">
        <div style={s.header}>
          <div>
            <div style={s.eyebrow}>Etapa do protocolo</div>
            <div style={s.titulo}>{etapa.label}</div>
            <div style={s.subtitulo}>{processo.numeroProcesso} — {processo.cliente}</div>
          </div>
          <button style={s.btnFechar} onClick={onFechar}>✕</button>
        </div>

        <div style={s.corpo}>
          <div style={s.linhaData}>
            <span>Data prevista: <strong style={{ fontFamily: font.mono }}>{fmt(etapa.dataPrevista)}</strong></span>
            {etapa.atrasada && <span style={s.badgeAtrasada}>Atrasada</span>}
          </div>

          <label style={s.checkboxLinha}>
            <input type="checkbox" checked={etapa.concluida} onChange={(e) => onConcluir(e.target.checked)} />
            Marcar como concluída
          </label>

          <form onSubmit={handleReagendar} style={s.formReagendar}>
            <label style={s.label}>
              {etapa.aguardandoConvocacao ? "Definir data (após convocação do pregoeiro)" : "Reagendar"}
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="datetime-local"
                style={s.input}
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
              />
              <button type="submit" style={s.btnSecundario}>Salvar data</button>
            </div>
          </form>

          {erro && <div style={s.erro}>{erro}</div>}

          <div style={s.anotacoesSecao}>
            <div style={s.anotacoesTitulo}>Anotações</div>
            {carregandoAnotacoes && <div style={s.vazio}>Carregando…</div>}
            {!carregandoAnotacoes && anotacoes.length === 0 && <div style={s.vazio}>Nenhuma anotação ainda.</div>}
            <div style={s.listaAnotacoes}>
              {anotacoes.map((a) => (
                <div key={a.id} style={s.anotacaoItem}>
                  <div style={s.anotacaoAutor}>{a.autor}</div>
                  <div style={s.anotacaoTexto}>{a.texto}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAdicionarAnotacao} style={s.formAnotacao}>
              <input style={s.input} placeholder="Seu nome" value={autor} onChange={(e) => setAutor(e.target.value)} />
              <textarea style={{ ...s.input, resize: "vertical", minHeight: 50 }} placeholder="Escreva uma anotação para a equipe…" value={texto} onChange={(e) => setTexto(e.target.value)} />
              <button type="submit" style={s.btnPrimario}>Adicionar anotação</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: "fixed", inset: 0, background: "rgba(20,33,61,0.6)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  painel: { background: color.paperRaised, borderRadius: 12, width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(20,33,61,0.35)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "18px 20px", borderBottom: `1px solid ${color.paper}` },
  eyebrow: { fontSize: 10, fontWeight: 600, color: color.brasaoDeep, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 },
  titulo: { fontSize: 16, fontWeight: 600, color: color.ink, fontFamily: font.display },
  subtitulo: { fontSize: 12, color: color.grafite, marginTop: 3, fontFamily: font.mono },
  btnFechar: { background: "none", border: "none", cursor: "pointer", fontSize: 14, color: color.grafiteLight },
  corpo: { padding: 20, display: "flex", flexDirection: "column", gap: 14 },
  linhaData: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: color.grafite },
  badgeAtrasada: { fontSize: 10, fontWeight: 700, color: color.carimbo, background: color.carimboSoft, padding: "2px 8px", borderRadius: 99 },
  checkboxLinha: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: color.grafite },
  formReagendar: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 11, color: color.grafite, fontWeight: 600 },
  input: { padding: "8px 10px", fontSize: 12, borderRadius: 6, border: `1px solid ${color.paperLine}`, width: "100%", boxSizing: "border-box", fontFamily: font.body, background: color.paperRaised, color: color.ink },
  btnSecundario: { padding: "8px 14px", background: color.paper, border: `1px solid ${color.paperLine}`, borderRadius: 6, fontSize: 12, cursor: "pointer", color: color.ink },
  btnPrimario: { padding: "9px 0", background: color.brasaoDeep, color: "#FCF7EE", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  erro: { fontSize: 12, color: color.carimbo, background: color.carimboSoft, padding: "8px 10px", borderRadius: 6 },
  anotacoesSecao: { borderTop: `1px solid ${color.paper}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 },
  anotacoesTitulo: { fontSize: 12, fontWeight: 700, color: color.ink },
  vazio: { fontSize: 12, color: color.grafiteLight },
  listaAnotacoes: { display: "flex", flexDirection: "column", gap: 8, maxHeight: 160, overflowY: "auto" },
  anotacaoItem: { background: color.paper, borderRadius: 8, padding: "8px 10px" },
  anotacaoAutor: { fontSize: 11, fontWeight: 700, color: color.grafite },
  anotacaoTexto: { fontSize: 12, color: color.ink, marginTop: 2 },
  formAnotacao: { display: "flex", flexDirection: "column", gap: 6 },
};
