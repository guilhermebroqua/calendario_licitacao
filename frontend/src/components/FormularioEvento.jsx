import { useState } from "react";
import { verificarConflitos } from "../services/eventoService";
import { color, font } from "../styles/tokens";

const CATEGORIAS = [
  { valor: "PRAZO", label: "Prazo" },
  { valor: "REUNIAO", label: "Reunião" },
  { valor: "AUDIENCIA", label: "Audiência / Sessão Pública" },
  { valor: "OUTRO", label: "Outro" },
];

const DIAS_ALERTA = [3, 5, 7, 15];

export default function FormularioEvento({ eventoInicial, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    titulo: eventoInicial?.titulo ?? "",
    dataInicio: eventoInicial?.dataInicio?.slice(0, 16) ?? "",
    dataFim: eventoInicial?.dataFim?.slice(0, 16) ?? "",
    categoria: eventoInicial?.categoria ?? "",
    descricao: eventoInicial?.descricao ?? "",
    processoLicitatorio: eventoInicial?.processoLicitatorio ?? "",
    diasAlerta: eventoInicial?.diasAlerta ?? 3,
  });

  const [erros, setErros] = useState({});
  const [conflito, setConflito] = useState(null);
  const [dtoConflito, setDtoConflito] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErros((prev) => ({ ...prev, [campo]: null }));
    setConflito(null);
  }

  function validar() {
    const novosErros = {};

    if (!form.titulo.trim()) {
      novosErros.titulo = "O campo título é obrigatório";
    }

    if (!form.dataInicio) novosErros.dataInicio = "Data de início é obrigatória";
    if (!form.dataFim) novosErros.dataFim = "Data de fim é obrigatória";

    if (form.dataInicio && form.dataFim && form.dataFim <= form.dataInicio) {
      novosErros.dataFim = "A hora de fim deve ser posterior à hora de início";
    }

    if (!form.categoria) novosErros.categoria = "A categoria é obrigatória";

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    setSalvando(true);
    try {
      const dto = {
        ...form,
        id: eventoInicial?.id ?? null,
        dataInicio: form.dataInicio + ":00",
        dataFim: form.dataFim + ":00",
      };

      const resultado = await verificarConflitos(dto);
      if (resultado.temConflito) {
        setConflito(resultado.conflitos[0]);
        setDtoConflito({ ...dto, ignorarConflito: true });
        setSalvando(false);
        return;
      }

      await onSalvar(dto);
    } catch (err) {
      setErros({ geral: err.message });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.eyebrow}>{eventoInicial ? "Editar registro" : "Novo registro"}</div>
      <h2 style={styles.titulo}>
        {eventoInicial ? "Editar evento" : "Novo evento"}
      </h2>

      <Campo id="ev-titulo" label="Título *" erro={erros.titulo}>
        <input
          id="ev-titulo"
          style={{ ...styles.input, ...(erros.titulo ? styles.inputErro : {}) }}
          value={form.titulo}
          onChange={(e) => atualizar("titulo", e.target.value)}
          placeholder="Ex: Sessão pública PE 045/2025"
        />
      </Campo>

      <div style={styles.row}>
        <Campo id="ev-inicio" label="Data e hora de início *" erro={erros.dataInicio}>
          <input
            id="ev-inicio"
            type="datetime-local"
            style={{ ...styles.input, ...(erros.dataInicio ? styles.inputErro : {}) }}
            value={form.dataInicio}
            onChange={(e) => atualizar("dataInicio", e.target.value)}
          />
        </Campo>
        <Campo id="ev-fim" label="Data e hora de fim *" erro={erros.dataFim}>
          <input
            id="ev-fim"
            type="datetime-local"
            style={{ ...styles.input, ...(erros.dataFim ? styles.inputErro : {}) }}
            value={form.dataFim}
            onChange={(e) => atualizar("dataFim", e.target.value)}
          />
        </Campo>
      </div>

      <Campo id="ev-categoria" label="Categoria *" erro={erros.categoria}>
        <select
          id="ev-categoria"
          style={{ ...styles.input, ...(erros.categoria ? styles.inputErro : {}) }}
          value={form.categoria}
          onChange={(e) => atualizar("categoria", e.target.value)}
        >
          <option value="">Selecione...</option>
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>{c.label}</option>
          ))}
        </select>
      </Campo>

      <Campo id="ev-processo" label="Processo licitatório">
        <input
          id="ev-processo"
          style={styles.input}
          value={form.processoLicitatorio}
          onChange={(e) => atualizar("processoLicitatorio", e.target.value)}
          placeholder="Ex: PE 045/2025 — Compras.gov.br"
        />
      </Campo>

      <Campo id="ev-alerta" label="Alerta antecipado (dias)">
        <select
          id="ev-alerta"
          style={styles.input}
          value={form.diasAlerta}
          onChange={(e) => atualizar("diasAlerta", Number(e.target.value))}
        >
          {DIAS_ALERTA.map((d) => (
            <option key={d} value={d}>{d} dias antes</option>
          ))}
        </select>
      </Campo>

      {erros.geral && (
        <div style={styles.alertaDanger}>{erros.geral}</div>
      )}

      {conflito && (
        <div style={styles.alertaDanger}>
          <div style={styles.alertaEyebrow}>Sobreposição de horário</div>
          Este horário coincide com <em>{conflito.titulo}</em>. Em licitações, múltiplos processos podem ocorrer simultaneamente.
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button type="button" style={styles.btnPerigo} onClick={() => onSalvar(dtoConflito)}>
              Salvar mesmo assim
            </button>
            <button type="button" style={styles.btnSecundario} onClick={() => setConflito(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={styles.acoes}>
        <button type="submit" style={styles.btnPrimario} disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar evento"}
        </button>
        <button type="button" style={styles.btnSecundario} onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Campo({ id, label, erro, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      {children}
      {erro && <span style={styles.erroTexto}>{erro}</span>}
    </div>
  );
}

const styles = {
  form: { display: "flex", flexDirection: "column", maxWidth: 560, margin: "0 auto", padding: 26 },
  eyebrow: { fontSize: 10.5, fontWeight: 600, color: color.brasaoDeep, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 },
  titulo: { fontSize: 19, fontWeight: 600, marginBottom: 20, color: color.ink, fontFamily: font.display },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { display: "block", fontSize: 12, color: color.grafite, marginBottom: 4, fontWeight: 500 },
  input: {
    width: "100%", padding: "9px 11px", fontSize: 13, borderRadius: 6,
    border: `1px solid ${color.paperLine}`, background: color.paperRaised, color: color.ink, boxSizing: "border-box",
    fontFamily: font.body,
  },
  inputErro: { borderColor: color.carimbo },
  erroTexto: { fontSize: 11, color: color.carimbo, marginTop: 3, display: "block" },
  alertaEyebrow: { fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 },
  alertaDanger: {
    padding: "11px 14px", background: color.carimboSoft, border: `1px solid ${color.carimbo}55`,
    borderRadius: 6, fontSize: 13, color: color.carimbo, marginBottom: 12,
  },
  acoes: { display: "flex", gap: 10, marginTop: 8 },
  btnPrimario: {
    flex: 1, padding: "10px 0", background: color.brasaoDeep, color: "#FCF7EE",
    border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  btnSecundario: {
    padding: "10px 20px", background: color.paperRaised, color: color.ink,
    border: `1px solid ${color.paperLine}`, borderRadius: 6, fontSize: 13, cursor: "pointer",
  },
  btnPerigo: {
    padding: "7px 12px", background: color.carimbo, color: "#FCF7EE",
    border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer",
  },
};
