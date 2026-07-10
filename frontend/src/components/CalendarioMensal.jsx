import { useMemo, useState } from "react";
import { color, font } from "../styles/tokens";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const COR = {
  PRAZO:    { bg: color.carimboSoft, text: color.carimbo, dot: color.carimbo },
  REUNIAO:  { bg: color.ferroSoft, text: color.ferro, dot: color.ferro },
  AUDIENCIA:{ bg: color.brasaoSoft, text: color.brasaoDeep, dot: color.brasaoDeep },
  OUTRO:    { bg: color.seloSoft, text: color.selo, dot: color.selo },
  CONFLITO: { bg: color.carimboSoft, text: color.carimbo, dot: color.carimbo },
};

export default function CalendarioMensal({ ano, mes, eventos, onMesAnterior, onProximoMes, onDiaClick }) {
  const hoje = new Date();
  const [hoveredDay, setHoveredDay] = useState(null);

  const dias = useMemo(() => {
    const primeiroDia = new Date(ano, mes - 1, 1).getDay();
    const totalDias = new Date(ano, mes, 0).getDate();
    const grid = [];

    for (let i = 0; i < primeiroDia; i++) grid.push({ dia: null });

    for (let d = 1; d <= totalDias; d++) {
      const dataStr = `${ano}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const evsDia = eventos.filter((e) => e.dataInicio?.startsWith(dataStr));
      grid.push({ dia: d, dataStr, eventos: evsDia, temConflito: evsDia.length > 1 });
    }

    while (grid.length % 7 !== 0) grid.push({ dia: null });
    return grid;
  }, [ano, mes, eventos]);

  const isHoje = (d) =>
    d === hoje.getDate() && mes === hoje.getMonth() + 1 && ano === hoje.getFullYear();

  const isFimDeSemana = (idx) => idx % 7 === 0 || idx % 7 === 6;

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <h2 style={s.mesAno}>{MESES[mes - 1]}</h2>
          <span style={s.ano}>{ano}</span>
        </div>
        <div style={s.navBtns}>
          <button style={s.navBtn} onClick={onMesAnterior} title="Mês anterior">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button style={s.navBtn} onClick={onProximoMes} title="Próximo mês">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={s.legenda}>
        {Object.entries(COR).filter(([k]) => k !== "CONFLITO").map(([cat, cor]) => (
          <span key={cat} style={s.legendaItem}>
            <span style={{ ...s.legendaDot, background: cor.dot }} />
            {cat.charAt(0) + cat.slice(1).toLowerCase()}
          </span>
        ))}
        <span style={s.legendaItem}>
          <span style={{ ...s.legendaDot, background: COR.CONFLITO.dot }} />
          Sobreposição
        </span>
      </div>

      <div style={s.grid}>
        {DIAS_SEMANA.map((d, i) => (
          <div key={d} style={{ ...s.cabDia, ...(i === 0 || i === 6 ? s.cabFds : {}) }}>
            {d}
          </div>
        ))}

        {dias.map((item, idx) => {
          const fds = isFimDeSemana(idx);
          const hoje_ = item.dia && isHoje(item.dia);
          const hovered = hoveredDay === idx && item.dia;

          return (
            <div
              key={idx}
              style={{
                ...s.celula,
                ...(fds ? s.celulaFds : {}),
                ...(hoje_ ? s.celulaHoje : {}),
                ...(hovered ? s.celulaHover : {}),
                ...(!item.dia ? s.celulaVazia : {}),
              }}
              onClick={() => item.dia && onDiaClick && onDiaClick(item)}
              onMouseEnter={() => item.dia && setHoveredDay(idx)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {item.dia && (
                <>
                  <div style={hoje_ ? s.numDiaHoje : s.numDia}>
                    {item.dia}
                  </div>
                  <div style={s.eventos}>
                    {(item.temConflito
                      ? item.eventos
                      : item.eventos
                    ).slice(0, 3).map((ev, j) => {
                      const c = COR[ev.categoria] ?? COR.OUTRO;
                      return (
                        <div
                          key={j}
                          style={{
                            ...s.pill,
                            background: c.bg,
                            color: c.text,
                            borderLeft: `3px solid ${c.dot}`,
                          }}
                          title={ev.titulo}
                        >
                          {ev.titulo}
                        </div>
                      );
                    })}
                    {item.eventos.length > 3 && (
                      <div style={s.mais}>+{item.eventos.length - 3} mais</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrapper: {
    background: color.paperRaised,
    borderRadius: 10,
    border: `1px solid ${color.paperLine}`,
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(20,33,61,0.04)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: `1px solid ${color.paper}`,
  },
  headerLeft: { display: "flex", alignItems: "baseline", gap: 10 },
  mesAno: { fontSize: 21, fontWeight: 600, color: color.ink, margin: 0, fontFamily: font.display },
  ano: { fontSize: 15, color: color.grafiteLight, fontWeight: 400, fontFamily: font.mono },
  navBtns: { display: "flex", gap: 4 },
  navBtn: {
    width: 32, height: 32,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: color.paper, border: `1px solid ${color.paperLine}`,
    borderRadius: 7, cursor: "pointer", color: color.ink,
    transition: "background 0.15s",
  },
  legenda: {
    display: "flex", gap: 16, padding: "10px 24px",
    background: color.paper, borderBottom: `1px solid ${color.paperLine}`,
    flexWrap: "wrap",
  },
  legendaItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: color.grafite },
  legendaDot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    borderTop: `1px solid ${color.paper}`,
  },
  cabDia: {
    padding: "10px 0",
    textAlign: "center",
    fontSize: 10.5,
    fontWeight: 600,
    color: color.grafiteLight,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    background: color.paper,
    borderBottom: `1px solid ${color.paperLine}`,
  },
  cabFds: { color: "#B7AF9C" },
  celula: {
    height: 132,
    minWidth: 0,
    padding: "8px 6px 6px",
    borderRight: `1px solid ${color.paper}`,
    borderBottom: `1px solid ${color.paper}`,
    overflow: "hidden",
    cursor: "pointer",
    transition: "background 0.1s",
    position: "relative",
  },
  celulaFds: { background: "rgba(220,214,196,0.25)" },
  celulaHoje: { background: color.brasaoSoft },
  celulaHover: { background: "rgba(220,214,196,0.35)" },
  celulaVazia: { background: "rgba(220,214,196,0.25)", cursor: "default", opacity: 0.4 },
  numDia: {
    fontSize: 12.5,
    fontWeight: 500,
    color: color.grafite,
    lineHeight: 1,
    marginBottom: 4,
    fontFamily: font.mono,
    width: 24, height: 24,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  numDiaHoje: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "#FCF7EE",
    lineHeight: 1,
    marginBottom: 4,
    fontFamily: font.mono,
    width: 24, height: 24,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: color.brasaoDeep,
    borderRadius: "50%",
  },
  eventos: { display: "flex", flexDirection: "column", gap: 2 },
  pill: {
    fontSize: 10,
    fontWeight: 500,
    padding: "2px 6px",
    borderRadius: 4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.6,
  },
  mais: {
    fontSize: 10,
    color: color.grafiteLight,
    padding: "1px 4px",
    fontWeight: 500,
  },
};
