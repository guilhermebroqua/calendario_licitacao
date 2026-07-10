import { useState } from "react";
import { color, font } from "../styles/tokens";

export default function FormularioProcesso({ onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    cliente: "",
    numeroProcesso: "",
    objeto: "",
    dataAbertura: "",
    diasUteisDocumentacao: 5,
  });
  const [erros, setErros] = useState({});
  const [avisos, setAvisos] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState(null);

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErros((prev) => ({ ...prev, [campo]: null }));
  }

  function validar() {
    const novosErros = {};
    if (!form.cliente.trim()) novosErros.cliente = "O cliente/órgão é obrigatório";
    if (!form.numeroProcesso.trim()) novosErros.numeroProcesso = "O número do processo é obrigatório";
    if (!form.dataAbertura) novosErros.dataAbertura = "A data de abertura é obrigatória";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    setSalvando(true);
    setErroGeral(null);
    try {
      const dto = {
        ...form,
        dataAbertura: form.dataAbertura + ":00",
        diasUteisDocumentacao: Number(form.diasUteisDocumentacao) || 5,
      };
      const criado = await onSalvar(dto);
      if (criado?.avisosMesmoDia?.length) {
        setAvisos(criado.avisosMesmoDia);
        setSalvando(false);
        return;
      }
    } catch (err) {
      setErroGeral(err.message);
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.eyebrow}>Abertura de protocolo</div>
      <h2 style={styles.titulo}>Novo processo licitatório</h2>

      <Campo id="campo-cliente" label="Cliente / Órgão *" erro={erros.cliente}>
        <input
          id="campo-cliente"
          style={{ ...styles.input, ...(erros.cliente ? styles.inputErro : {}) }}
          value={form.cliente}
          onChange={(e) => atualizar("cliente", e.target.value)}
          placeholder="Ex: Prefeitura Municipal de Exemplo"
        />
      </Campo>

      <Campo id="campo-numero" label="Número do processo/edital *" erro={erros.numeroProcesso}>
        <input
          id="campo-numero"
          style={{ ...styles.input, ...(erros.numeroProcesso ? styles.inputErro : {}) }}
          value={form.numeroProcesso}
          onChange={(e) => atualizar("numeroProcesso", e.target.value)}
          placeholder="Ex: PE 045/2026"
        />
      </Campo>

      <Campo id="campo-objeto" label="Objeto">
        <input
          id="campo-objeto"
          style={styles.input}
          value={form.objeto}
          onChange={(e) => atualizar("objeto", e.target.value)}
          placeholder="Ex: Aquisição de equipamentos de informática"
        />
      </Campo>

      <Campo id="campo-abertura" label="Data e hora de abertura da sessão *" erro={erros.dataAbertura}>
        <input
          id="campo-abertura"
          type="datetime-local"
          style={{ ...styles.input, ...(erros.dataAbertura ? styles.inputErro : {}) }}
          value={form.dataAbertura}
          onChange={(e) => atualizar("dataAbertura", e.target.value)}
        />
      </Campo>

      <Campo id="campo-dias-uteis" label="Preparar documentação: dias úteis antes da abertura">
        <input
          id="campo-dias-uteis"
          type="number"
          min="1"
          style={styles.input}
          value={form.diasUteisDocumentacao}
          onChange={(e) => atualizar("diasUteisDocumentacao", e.target.value)}
        />
      </Campo>

      {erroGeral && <div style={styles.alertaDanger}>{erroGeral}</div>}

      {avisos.length > 0 && (
        <div style={styles.alertaAviso}>
          <div style={styles.alertaEyebrow}>Mesmo dia, outra sessão</div>
          <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
            {avisos.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      <div style={styles.info}>
        O quadro de etapas é gerado automaticamente (dias úteis, descontando fins de semana e feriados nacionais).
      </div>

      <div style={styles.acoes}>
        <button type="submit" style={styles.btnPrimario} disabled={salvando}>
          {salvando ? "Salvando…" : avisos.length ? "Continuar mesmo assim" : "Criar processo"}
        </button>
        <button type="button" style={styles.btnSecundario} onClick={onCancelar}>Cancelar</button>
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
  form: { display: "flex", flexDirection: "column", maxWidth: 520, margin: "0 auto", padding: 26 },
  eyebrow: { fontSize: 10.5, fontWeight: 600, color: color.brasaoDeep, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 },
  titulo: { fontSize: 19, fontWeight: 600, marginBottom: 20, color: color.ink, fontFamily: font.display },
  label: { display: "block", fontSize: 12, color: color.grafite, marginBottom: 4, fontWeight: 500 },
  input: { width: "100%", padding: "9px 11px", fontSize: 13, borderRadius: 6, border: `1px solid ${color.paperLine}`, background: color.paperRaised, color: color.ink, boxSizing: "border-box", fontFamily: font.body },
  inputErro: { borderColor: color.carimbo },
  erroTexto: { fontSize: 11, color: color.carimbo, marginTop: 3, display: "block" },
  alertaEyebrow: { fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" },
  alertaDanger: { padding: "11px 14px", background: color.carimboSoft, border: `1px solid ${color.carimbo}55`, borderRadius: 6, fontSize: 13, color: color.carimbo, marginBottom: 12 },
  alertaAviso: { padding: "11px 14px", background: color.brasaoSoft, border: `1px solid ${color.brasao}55`, borderRadius: 6, fontSize: 12, color: color.brasaoDeep, marginBottom: 12 },
  info: { fontSize: 11, color: color.grafiteLight, marginBottom: 12 },
  acoes: { display: "flex", gap: 10, marginTop: 8 },
  btnPrimario: { flex: 1, padding: "10px 0", background: color.brasaoDeep, color: "#FCF7EE", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnSecundario: { padding: "10px 20px", background: color.paperRaised, color: color.ink, border: `1px solid ${color.paperLine}`, borderRadius: 6, fontSize: 13, cursor: "pointer" },
};
