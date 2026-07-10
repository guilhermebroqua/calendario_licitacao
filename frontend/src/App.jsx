import { useState, useEffect } from "react";
import CalendarioMensal from "./components/CalendarioMensal";
import FormularioEvento from "./components/FormularioEvento";
import QuadroEtapas from "./components/QuadroEtapas";
import FormularioProcesso from "./components/FormularioProcesso";
import RelatoriosView from "./components/RelatoriosView";
import { useEventos } from "./hooks/useEventos";
import { useProcessos } from "./hooks/useProcessos";
import { color, font } from "./styles/tokens";

const BrandSeal = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="10" r="3.6" fill="currentColor" />
    <path d="M8 16.5L5.5 22M16 16.5L18.5 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconClipboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
);
const IconBell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconBarChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconTrend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCheckCircle = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const COR_CAT   = { PRAZO: color.carimbo, REUNIAO: color.ferro, AUDIENCIA: color.brasaoDeep, OUTRO: color.selo };
const BG_CAT    = { PRAZO: color.carimboSoft, REUNIAO: color.ferroSoft, AUDIENCIA: color.brasaoSoft, OUTRO: color.seloSoft };
const LABEL_CAT = { PRAZO: "Prazo", REUNIAO: "Reunião", AUDIENCIA: "Audiência", OUTRO: "Outro" };
const CATS      = Object.keys(COR_CAT);
const MESES     = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                   "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function diasAte(iso) {
  if (!iso) return Infinity;
  return Math.ceil((new Date(iso) - new Date()) / 86400000);
}
function fmtData(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function fmtDataCurta(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
function pad2(n) { return String(n).padStart(2, "0"); }
function ehSomenteLeitura(ev) { return typeof ev.id === "number" && ev.id < 0; }

function StatCard({ titulo, valor, cor, bg, icon, sub }) {
  return (
    <div style={{ ...S.card, padding: "18px 20px", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ ...S.statIcon, background: bg, color: cor }}>{icon}</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: color.ink }}>{titulo}</div>
      </div>
      <div style={S.statValor}>{valor}</div>
      <div style={{ fontSize: 11, color: color.grafiteLight }}>{sub}</div>
    </div>
  );
}

function CountBox({ val, label, urgent }) {
  return (
    <div style={{ ...S.countBox, color: urgent ? "#E8B4A6" : color.paperRaised }}>
      <span style={S.countBoxVal}>{val}</span>
      <span style={{ ...S.countBoxLabel, color: urgent ? "#E8B4A6" : "#8FA0BD" }}>{label}</span>
    </div>
  );
}

function AlertaBand({ titulo, sub, eventos, cor, bg, onEditar, onExcluir }) {
  if (eventos.length === 0) return null;
  return (
    <div style={{ ...S.card, overflow: "hidden" }}>
      <div style={{ background: bg, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${cor}30` }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: cor, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: cor }}>{titulo}</span>
          <span style={{ fontSize: 11, color: cor, opacity: 0.75, marginLeft: 8 }}>{sub}</span>
        </div>
        <span style={S.cardCount}>{eventos.length}</span>
      </div>
      {eventos.sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio)).map(ev => {
        const d = diasAte(ev.dataInicio);
        return (
          <div key={ev.id} style={S.row}>
            <div style={{ ...S.alertaIcon, background: bg, color: cor }}><IconAlert /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.rowTitulo}>{ev.titulo}</div>
              <div style={S.rowMeta}>
                {fmtData(ev.dataInicio)}
                {ev.processoLicitatorio && <> · <span style={S.proc}>{ev.processoLicitatorio}</span></>}
              </div>
            </div>
            <span style={{ ...S.tag, background: BG_CAT[ev.categoria], color: COR_CAT[ev.categoria] }}>
              {LABEL_CAT[ev.categoria] ?? ev.categoria}
            </span>
            <div style={{ ...S.diasBadge, background: bg, color: cor }}>
              {d === 0 ? "Hoje" : d === 1 ? "Amanhã" : `${d}d`}
            </div>
            {ehSomenteLeitura(ev) ? (
              <span style={S.readonlyTag}>Somente leitura</span>
            ) : (
              <div style={S.acoes}>
                <button style={S.btnAcao} onClick={() => onEditar(ev)}><IconEdit /></button>
                <button style={{ ...S.btnAcao, ...S.btnAcaoPerigo }} onClick={() => onExcluir(ev)}><IconTrash /></button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const hoje = new Date();
  const [ano, setAno]               = useState(hoje.getFullYear());
  const [mes, setMes]               = useState(hoje.getMonth() + 1);
  const [aba, setAba]               = useState("dashboard");
  const [modalAberto, setModal]     = useState(false);
  const [eventoEditar, setEditar]   = useState(null);
  const [filtrosCat, setFiltrosCat] = useState(new Set(CATS));
  const [busca, setBusca]           = useState("");
  const [contagem, setContagem]     = useState(null);
  const [modalProcesso, setModalProcesso] = useState(false);

  const { eventos, alertas, carregando, erro, carregarMes, carregarAlertas, criar, editar, excluir } = useEventos();
  const {
    processos: processosQuadro, resumo, carregando: carregandoProcessos,
    carregarProcessos, carregarResumo, criarProcesso,
    favoritar, finalizar, excluir: excluirProcesso,
    concluirEtapa, reagendarEtapa, sincronizar,
  } = useProcessos();

  useEffect(() => { carregarMes(ano, mes); }, [ano, mes]);
  useEffect(() => { carregarAlertas(30); }, []);
  useEffect(() => { carregarProcessos(); carregarResumo(); }, []);

  useEffect(() => {
    const agora = new Date();
    const todos = [...new Map([...eventos, ...alertas].map(e => [e.id, e])).values()];
    const proximos = todos
      .filter(e => new Date(e.dataInicio) > agora)
      .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));

    if (!proximos[0]) { setContagem(null); return; }
    const alvo = proximos[0];

    function tick() {
      const diff = new Date(alvo.dataInicio) - new Date();
      if (diff <= 0) { setContagem({ alvo, expired: true }); return; }
      setContagem({
        alvo,
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000) / 60000),
        secs:  Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [eventos, alertas]);

  function navegarMes(d) {
    const dt = new Date(ano, mes - 1 + d, 1);
    setAno(dt.getFullYear()); setMes(dt.getMonth() + 1);
  }

  function toggleFiltro(cat) {
    setFiltrosCat(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  async function handleSalvar(dto) {
    try {
      eventoEditar ? await editar(eventoEditar.id, dto) : await criar(dto);
      setModal(false); setEditar(null);
      carregarAlertas(30);
    } catch (e) { alert(e.message); }
  }

  async function handleExcluir(ev) {
    if (ehSomenteLeitura(ev)) return;
    const just = ev.processoLicitatorio
      ? prompt("Justificativa para exclusão (obrigatória para processos ativos):")
      : null;
    if (ev.processoLicitatorio && !just) return;
    if (!window.confirm(`Excluir "${ev.titulo}"?`)) return;
    try { await excluir(ev.id, just); carregarAlertas(30); } catch (e) { alert(e.message); }
  }

  function abrirEdicao(ev) {
    if (ehSomenteLeitura(ev)) return;
    setEditar(ev);
    setModal(true);
  }

  async function handleNovoProcesso(dto) {
    try {
      const criado = await criarProcesso(dto);
      if (!criado.avisosMesmoDia?.length) {
        setModalProcesso(false);
        carregarResumo();
        carregarMes(ano, mes);
        carregarAlertas(30);
      }
      return criado;
    } catch (e) { alert(e.message); throw e; }
  }

  async function handleFavoritarProcesso(id, favorito) {
    try { await favoritar(id, favorito); carregarResumo(); } catch (e) { alert(e.message); }
  }

  async function handleFinalizarProcesso(id) {
    if (!window.confirm("Marcar este processo como finalizado?")) return;
    try { await finalizar(id); carregarResumo(); } catch (e) { alert(e.message); }
  }

  async function handleExcluirProcesso(id) {
    if (!window.confirm("Excluir este processo e todas as suas etapas?")) return;
    try {
      await excluirProcesso(id);
      carregarResumo();
      carregarMes(ano, mes);
      carregarAlertas(30);
    } catch (e) { alert(e.message); }
  }

  async function handleConcluirEtapa(processoId, etapaId, concluida) {
    try {
      await concluirEtapa(processoId, etapaId, concluida);
      carregarResumo();
      carregarMes(ano, mes);
      carregarAlertas(30);
    } catch (e) { alert(e.message); }
  }

  async function handleReagendarEtapa(processoId, etapaId, novaData) {
    try {
      await reagendarEtapa(processoId, etapaId, novaData);
      carregarMes(ano, mes);
      carregarAlertas(30);
    } catch (e) { alert(e.message); }
  }

  async function handleSincronizar() {
    try {
      const total = await sincronizar();
      alert(`${total} novo(s) edital(is) sincronizado(s) do Módulo 4!`);
      carregarMes(ano, mes);
      carregarAlertas(30);
    } catch (e) {
      alert("Erro ao sincronizar editais: " + e.message);
    }
  }

  const hojeStr      = `${hoje.getFullYear()}-${pad2(hoje.getMonth()+1)}-${pad2(hoje.getDate())}`;
  const eventosHoje  = eventos.filter(e => e.dataInicio?.startsWith(hojeStr));
  const criticos     = alertas.filter(e => { const d = diasAte(e.dataInicio); return d >= 0 && d <= 3; });
  const atencao      = alertas.filter(e => { const d = diasAte(e.dataInicio); return d > 3 && d <= 7; });
  const informativos = alertas.filter(e => diasAte(e.dataInicio) > 7);
  const processos    = eventos.filter(e => e.processoLicitatorio);

  const eventosFiltrados = eventos.filter(e => filtrosCat.has(e.categoria));
  const eventosBusca     = eventosFiltrados.filter(e =>
    !busca ||
    e.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
    e.processoLicitatorio?.toLowerCase().includes(busca.toLowerCase())
  );

  const proximos7 = alertas
    .filter(e => { const d = diasAte(e.dataInicio); return d >= 0 && d <= 7; })
    .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));

  const NAV_ITEMS = [
    { id: "dashboard",  label: "Painel",    Icon: IconHome },
    { id: "calendario", label: "Calendário", Icon: IconCalendar },
    { id: "quadro",     label: "Quadro",     Icon: IconClipboard },
    { id: "processos",  label: "Processos",  Icon: IconClipboard },
    { id: "alertas",    label: "Alertas",    Icon: IconBell },
    { id: "relatorios", label: "Relatórios", Icon: IconBarChart },
  ];

  const PAGE_TITLES = {
    dashboard: "Painel de Controle", calendario: "Calendário", quadro: "Quadro de Etapas",
    processos: "Processos Licitatórios", alertas: "Central de Alertas", relatorios: "Relatórios Gerenciais",
  };
  const PAGE_SUBS   = {
    dashboard:  `Visão geral — ${MESES[hoje.getMonth()]} de ${hoje.getFullYear()}`,
    calendario: `${MESES[mes - 1]} de ${ano}`,
    quadro:     `${processosQuadro.length} processo(s) no quadro — etapas calculadas em dias úteis`,
    processos:  `${processos.length} processo(s) com prazo cadastrado`,
    alertas:    `${criticos.length} crítico(s) · ${atencao.length} em atenção · ${informativos.length} informativo(s)`,
    relatorios: "Diário, semanal ou todas as etapas previstas",
  };

  return (
    <div style={S.shell}>
      <aside style={S.sidebar}>
        <div style={S.brand}>
          <div style={S.brandMark}><BrandSeal /></div>
          <div>
            <div style={S.brandName}>LicitaCalendário</div>
            <div style={S.brandSub}>Livro de Protocolo</div>
          </div>
        </div>

        <nav style={S.nav}>
          <p style={S.navLabel}>Principal</p>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const ativo = aba === id;
            return (
              <button key={id} style={{ ...S.navItem, ...(ativo ? S.navAtivo : {}) }} onClick={() => setAba(id)}>
                <span style={S.navTab(ativo)} />
                <span style={{ ...S.navIcon, ...(ativo ? S.navIconAtivo : {}) }}><Icon /></span>
                <span style={S.navText}>{label}</span>
                {id === "alertas" && criticos.length > 0 && <span style={S.badge}>{criticos.length}</span>}
              </button>
            );
          })}
        </nav>

        <div style={S.sidebarFooter}>
          <div style={S.footerOrg}>
            <div style={S.footerOrgDot} />
            <div>
              <div style={S.footerOrgNome}>Órgão Público</div>
              <div style={S.footerOrgSub}>Módulo Licitações</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={S.main}>
        <header style={S.topbar}>
          <div>
            <h1 style={S.pageTitle}>{PAGE_TITLES[aba]}</h1>
            <p style={S.pageSubtitle}>{PAGE_SUBS[aba]}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {aba === "calendario" && (
              <button style={S.btnSecNav} onClick={() => { setAno(hoje.getFullYear()); setMes(hoje.getMonth() + 1); }}>
                Hoje
              </button>
            )}
            {(aba === "processos" || aba === "quadro") && (
              <button style={S.btnSecNav} onClick={handleSincronizar} disabled={carregandoProcessos}>
                {carregandoProcessos ? "Sincronizando..." : "Sincronizar Editais (M4)"}
              </button>
            )}
            {aba !== "quadro" && aba !== "relatorios" && (
              <button style={S.btnNovo} onClick={() => { setEditar(null); setModal(true); }}>
                <IconPlus /> Novo evento
              </button>
            )}
          </div>
        </header>

        <div style={S.content}>
          {erro && <div style={S.erroBanner}>{erro}</div>}
          {carregando && <div style={S.loading}><div style={S.spinner} />Carregando…</div>}

          {aba === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={S.statsRow}>
                <StatCard titulo="Eventos este mês" valor={eventos.length} cor={color.ferro} bg={color.ferroSoft} icon={<IconCalendar />} sub="cadastrados no calendário" />
                <StatCard titulo="Processos ativos"  valor={processos.length} cor={color.selo} bg={color.seloSoft} icon={<IconClipboard />} sub="com número de processo" />
                <StatCard titulo="Alertas críticos"  valor={criticos.length} cor={color.carimbo} bg={color.carimboSoft} icon={<IconAlert />} sub="vencem em até 3 dias" />
                <StatCard titulo="Eventos hoje"       valor={eventosHoje.length} cor={color.brasaoDeep} bg={color.brasaoSoft} icon={<IconClock />} sub="agendados para hoje" />
              </div>

              <div style={S.midRow}>
                <div style={{ ...S.countdownCard, flex: 1.5 }}>
                  <div style={S.countdownLabel}>Contagem Regressiva · Próximo Prazo</div>
                  {contagem ? (
                    <>
                      <div style={S.countdownTitulo}>{contagem.alvo?.titulo}</div>
                      <div style={S.countdownMeta}>
                        {fmtData(contagem.alvo?.dataInicio)}
                        {contagem.alvo?.processoLicitatorio && ` · ${contagem.alvo.processoLicitatorio}`}
                      </div>
                      {contagem.expired ? (
                        <div style={{ fontSize: 14, color: "#8FA0BD", fontStyle: "italic", marginTop: 14 }}>Prazo encerrado</div>
                      ) : (
                        <>
                          <div style={S.countdownBoxes}>
                            <CountBox val={contagem.days}        label="dias"  urgent={contagem.days < 3} />
                            <span style={S.countSep}>:</span>
                            <CountBox val={pad2(contagem.hours)} label="horas" urgent={contagem.days < 1} />
                            <span style={S.countSep}>:</span>
                            <CountBox val={pad2(contagem.mins)}  label="min"   urgent={contagem.days < 1} />
                            <span style={S.countSep}>:</span>
                            <CountBox val={pad2(contagem.secs)}  label="seg"   urgent={contagem.days < 1} />
                          </div>
                          {contagem.days < 3 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, color: "#F0A99A", fontSize: 12, fontWeight: 600 }}>
                              <IconAlert /> Prazo crítico — atenção imediata necessária
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div style={{ ...S.vazio, color: "#8FA0BD" }}>Nenhum evento futuro cadastrado.</div>
                  )}
                </div>

                <div style={{ ...S.card, flex: 1, overflow: "hidden" }}>
                  <div style={S.cardHead}>
                    Eventos de Hoje <span style={S.cardCount}>{eventosHoje.length}</span>
                  </div>
                  {eventosHoje.length === 0
                    ? <p style={S.vazio}>Nenhum evento hoje.</p>
                    : eventosHoje.map(ev => (
                      <div key={ev.id} style={S.row}>
                        <div style={{ ...S.dot, background: COR_CAT[ev.categoria] ?? color.grafite }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={S.rowTitulo}>{ev.titulo}</div>
                          <div style={S.rowMeta}>{fmtData(ev.dataInicio)}</div>
                        </div>
                        <span style={{ ...S.tag, background: BG_CAT[ev.categoria], color: COR_CAT[ev.categoria] }}>
                          {LABEL_CAT[ev.categoria]}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div style={S.card}>
                <div style={S.cardHead}>
                  Próximos 7 dias <span style={S.cardCount}>{proximos7.length}</span>
                </div>
                {proximos7.length === 0
                  ? <p style={S.vazio}>Nenhum evento nos próximos 7 dias.</p>
                  : (
                    <div style={S.upcomingRow}>
                      {proximos7.map(ev => {
                        const d = diasAte(ev.dataInicio);
                        const cor = d <= 1 ? color.carimbo : d <= 3 ? color.brasaoDeep : color.ferro;
                        return (
                          <div key={ev.id} style={{ ...S.upcomingCard, borderTop: `3px solid ${cor}` }}>
                            <div style={{ fontSize: 10.5, color: cor, fontWeight: 700, marginBottom: 6, letterSpacing: "0.05em", fontFamily: font.mono }}>
                              {d === 0 ? "HOJE" : d === 1 ? "AMANHÃ" : `EM ${d} DIAS`}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: color.ink, lineHeight: 1.4, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {ev.titulo}
                            </div>
                            <div style={{ fontSize: 10, color: color.grafiteLight, marginBottom: 6, fontFamily: font.mono }}>{fmtDataCurta(ev.dataInicio)}</div>
                            <span style={{ ...S.tag, background: BG_CAT[ev.categoria], color: COR_CAT[ev.categoria], fontSize: 9 }}>
                              {LABEL_CAT[ev.categoria] ?? ev.categoria}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )
                }
              </div>

              {eventos.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardHead}>Distribuição por categoria este mês</div>
                  <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {CATS.map(cat => {
                      const count = eventos.filter(e => e.categoria === cat).length;
                      const pct   = eventos.length ? Math.round((count / eventos.length) * 100) : 0;
                      return (
                        <div key={cat}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: COR_CAT[cat] }} />
                              <span style={{ fontSize: 12, color: color.ink, fontWeight: 500 }}>{LABEL_CAT[cat]}</span>
                            </div>
                            <span style={{ fontSize: 11, color: color.grafiteLight, fontFamily: font.mono }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 6, background: color.paper, borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: COR_CAT[cat], borderRadius: 99, transition: "width 0.6s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {aba === "calendario" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={S.filtroBar}>
                <div style={S.filtroChips}>
                  <span style={{ fontSize: 11, color: color.grafiteLight, fontWeight: 600, alignSelf: "center", whiteSpace: "nowrap" }}>Filtrar:</span>
                  {CATS.map(cat => {
                    const ativo = filtrosCat.has(cat);
                    return (
                      <button key={cat} style={{ ...S.chip, background: ativo ? BG_CAT[cat] : color.paper, color: ativo ? COR_CAT[cat] : color.grafiteLight, border: `1.5px solid ${ativo ? COR_CAT[cat] : "transparent"}` }} onClick={() => toggleFiltro(cat)}>
                        <span style={{ ...S.chipDot, background: COR_CAT[cat] }} />
                        {LABEL_CAT[cat]}
                      </button>
                    );
                  })}
                  {filtrosCat.size < CATS.length && (
                    <button style={{ ...S.chip, color: color.grafite, border: `1.5px dashed ${color.paperLine}`, background: "none" }} onClick={() => setFiltrosCat(new Set(CATS))}>
                      Limpar filtros
                    </button>
                  )}
                </div>
                <div style={S.searchBox}>
                  <span style={S.searchIcon}><IconSearch /></span>
                  <input style={S.searchInput} placeholder="Buscar evento ou processo…" value={busca} onChange={e => setBusca(e.target.value)} />
                  {busca && <button style={S.searchClear} onClick={() => setBusca("")}><IconX /></button>}
                </div>
              </div>

              <CalendarioMensal
                ano={ano} mes={mes} eventos={eventosFiltrados}
                onMesAnterior={() => navegarMes(-1)}
                onProximoMes={() => navegarMes(1)}
              />

              {eventosBusca.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardHead}>
                    <span>{busca ? `Resultados para "${busca}"` : "Eventos do mês"}</span>
                    <span style={S.cardCount}>{eventosBusca.length}</span>
                  </div>
                  {eventosBusca.map(ev => (
                    <div key={ev.id} style={S.row}>
                      <div style={{ ...S.dot, background: COR_CAT[ev.categoria] ?? color.grafite }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={S.rowTitulo}>{ev.titulo}</div>
                        <div style={S.rowMeta}>
                          {fmtData(ev.dataInicio)}
                          {ev.processoLicitatorio && <> · <span style={S.proc}>{ev.processoLicitatorio}</span></>}
                        </div>
                      </div>
                      <span style={{ ...S.tag, background: BG_CAT[ev.categoria], color: COR_CAT[ev.categoria] }}>
                        {LABEL_CAT[ev.categoria]}
                      </span>
                      {ehSomenteLeitura(ev) ? (
                        <span style={S.readonlyTag}>Somente leitura</span>
                      ) : (
                        <div style={S.acoes}>
                          <button style={S.btnAcao} onClick={() => abrirEdicao(ev)}><IconEdit /></button>
                          <button style={{ ...S.btnAcao, ...S.btnAcaoPerigo }} onClick={() => handleExcluir(ev)}><IconTrash /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {busca && eventosBusca.length === 0 && (
                <div style={{ ...S.card, padding: 32, textAlign: "center" }}>
                  <div style={{ color: color.grafiteLight, fontSize: 13 }}>Nenhum resultado para "<strong>{busca}</strong>"</div>
                </div>
              )}
            </div>
          )}

          {aba === "processos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { label: "Total",           val: processos.length,                                                                              cor: color.ferro },
                  { label: "Críticos (≤3d)",  val: processos.filter(e => { const d = diasAte(e.dataInicio); return d >= 0 && d <= 3; }).length,   cor: color.carimbo },
                  { label: "Atenção (4–7d)",  val: processos.filter(e => { const d = diasAte(e.dataInicio); return d > 3 && d <= 7; }).length,    cor: color.brasaoDeep },
                  { label: "No prazo (>7d)",  val: processos.filter(e => diasAte(e.dataInicio) > 7).length,                                       cor: color.selo },
                ].map(({ label, val, cor }) => (
                  <div key={label} style={{ ...S.card, padding: "14px 18px", flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: cor, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: color.ink, fontFamily: font.mono }}>{val}</div>
                      <div style={{ fontSize: 10, color: color.grafiteLight, fontWeight: 500, marginTop: 1 }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={S.card}>
                <div style={S.cardHead}>
                  Todos os processos <span style={S.cardCount}>{processos.length}</span>
                </div>
                {processos.length === 0 && <p style={S.vazio}>Nenhum processo cadastrado com número de processo.</p>}
                {processos.sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio)).map(ev => {
                  const d = diasAte(ev.dataInicio);
                  const status = d < 0       ? { label: "Encerrado",         cor: color.grafiteLight, bg: color.paper }
                               : d === 0     ? { label: "Hoje!",             cor: color.carimbo, bg: color.carimboSoft }
                               : d <= 3      ? { label: `${d}d — Crítico`,   cor: color.carimbo, bg: color.carimboSoft }
                               : d <= 7      ? { label: `${d}d — Atenção`,   cor: color.brasaoDeep, bg: color.brasaoSoft }
                               :               { label: `${d} dias`,          cor: color.selo, bg: color.seloSoft };
                  return (
                    <div key={ev.id} style={S.row}>
                      <div style={{ ...S.dot, background: COR_CAT[ev.categoria] ?? color.grafite }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={S.rowTitulo}>{ev.titulo}</div>
                        <div style={S.rowMeta}><span style={S.proc}>{ev.processoLicitatorio}</span>{" · "}{fmtData(ev.dataInicio)}</div>
                      </div>
                      <span style={{ ...S.tag, background: BG_CAT[ev.categoria], color: COR_CAT[ev.categoria] }}>
                        {LABEL_CAT[ev.categoria]}
                      </span>
                      <span style={{ ...S.statusBadge, background: status.bg, color: status.cor }}>{status.label}</span>
                      {ehSomenteLeitura(ev) ? (
                        <span style={S.readonlyTag}>Somente leitura</span>
                      ) : (
                        <div style={S.acoes}>
                          <button style={S.btnAcao} onClick={() => abrirEdicao(ev)}><IconEdit /></button>
                          <button style={{ ...S.btnAcao, ...S.btnAcaoPerigo }} onClick={() => handleExcluir(ev)}><IconTrash /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {aba === "quadro" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {resumo && (
                <div style={S.statsRow}>
                  <StatCard titulo="Licitações gerenciadas" valor={resumo.totalGerenciadas} cor={color.ferro} bg={color.ferroSoft} icon={<IconClipboard />} sub="processos no quadro" />
                  <StatCard titulo="Favoritas" valor={resumo.totalFavoritas} cor={color.brasaoDeep} bg={color.brasaoSoft} icon={<IconAlert />} sub="marcadas com estrela" />
                  <StatCard titulo="Tarefas pendentes" valor={resumo.totalTarefasPendentes} cor={color.carimbo} bg={color.carimboSoft} icon={<IconClock />} sub="etapas não concluídas" />
                  <StatCard titulo="Em andamento" valor={resumo.totalAndamento} cor={color.selo} bg={color.seloSoft} icon={<IconTrend />} sub="processos ativos" />
                  <StatCard titulo="Finalizadas" valor={resumo.totalFinalizadas} cor={color.grafite} bg={color.paper} icon={<IconCheckCircle />} sub="licitações concluídas" />
                </div>
              )}
              <QuadroEtapas
                processos={processosQuadro}
                carregando={carregandoProcessos}
                onFavoritar={handleFavoritarProcesso}
                onFinalizar={handleFinalizarProcesso}
                onExcluir={handleExcluirProcesso}
                onConcluirEtapa={handleConcluirEtapa}
                onReagendarEtapa={handleReagendarEtapa}
                onNovoProcesso={() => setModalProcesso(true)}
              />
            </div>
          )}

          {aba === "relatorios" && <RelatoriosView />}

          {aba === "alertas" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {criticos.length === 0 && atencao.length === 0 && informativos.length === 0 && (
                <div style={{ ...S.card, padding: 48, textAlign: "center" }}>
                  <div style={{ color: color.selo, marginBottom: 12, display: "flex", justifyContent: "center" }}>
                    <IconCheckCircle />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: color.ink, fontFamily: font.display }}>Tudo em dia</div>
                  <div style={{ fontSize: 12, color: color.grafiteLight, marginTop: 4 }}>Nenhum alerta ativo no momento.</div>
                </div>
              )}
              <AlertaBand titulo="Crítico"     sub="Vence em até 3 dias"        eventos={criticos}     cor={color.carimbo} bg={color.carimboSoft} onEditar={abrirEdicao} onExcluir={handleExcluir} />
              <AlertaBand titulo="Atenção"     sub="Vence entre 4 e 7 dias"     eventos={atencao}      cor={color.brasaoDeep} bg={color.brasaoSoft} onEditar={abrirEdicao} onExcluir={handleExcluir} />
              <AlertaBand titulo="Informativo" sub="Vence em mais de 7 dias"    eventos={informativos} cor={color.ferro} bg={color.ferroSoft} onEditar={abrirEdicao} onExcluir={handleExcluir} />
            </div>
          )}
        </div>
      </main>

      {modalAberto && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && (setModal(false), setEditar(null))}>
          <div style={S.modal}>
            <FormularioEvento
              eventoInicial={eventoEditar}
              onSalvar={handleSalvar}
              onCancelar={() => { setModal(false); setEditar(null); }}
            />
          </div>
        </div>
      )}

      {modalProcesso && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setModalProcesso(false)}>
          <div style={S.modal}>
            <FormularioProcesso
              onSalvar={handleNovoProcesso}
              onCancelar={() => setModalProcesso(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  shell: { display: "flex", height: "100vh", fontFamily: font.body, background: color.paper, color: color.ink },

  sidebar:    { width: 244, background: color.ink, display: "flex", flexDirection: "column", flexShrink: 0 },
  brand:      { display: "flex", alignItems: "center", gap: 12, padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  brandMark:  { width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: color.brasao },
  brandName:  { fontSize: 14, fontWeight: 600, color: "#F4F1E8", letterSpacing: "-0.01em", fontFamily: font.display },
  brandSub:   { fontSize: 10, color: "#7C89A6", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" },
  nav:        { flex: 1, padding: "16px 10px", overflowY: "auto" },
  navLabel:   { fontSize: 10, fontWeight: 600, color: "#5C6883", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px 12px" },
  navItem:    { position: "relative", display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px 9px 14px", background: "none", border: "none", borderRadius: 0, cursor: "pointer", color: "#9AA6C0", fontSize: 13, fontWeight: 500, textAlign: "left", transition: "color 0.15s", marginBottom: 1 },
  navAtivo:   { color: "#F4F1E8" },
  navTab: (ativo) => ({ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: "0 3px 3px 0", background: ativo ? color.brasao : "transparent", transition: "background 0.15s" }),
  navIcon:    { display: "flex", color: "#5C6883", flexShrink: 0 },
  navIconAtivo: { color: color.brasao },
  navText:    { flex: 1 },
  badge:      { background: color.carimbo, color: "#fff", borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "1px 6px", minWidth: 18, textAlign: "center" },
  sidebarFooter: { padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" },
  footerOrg:     { display: "flex", alignItems: "center", gap: 10 },
  footerOrgDot:  { width: 8, height: 8, borderRadius: "50%", background: color.selo, flexShrink: 0 },
  footerOrgNome: { fontSize: 12, fontWeight: 500, color: "#C9CFDC" },
  footerOrgSub:  { fontSize: 10, color: "#5C6883" },

  main:         { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar:       { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", background: color.paperRaised, borderBottom: `1px solid ${color.paperLine}` },
  pageTitle:    { fontSize: 20, fontWeight: 600, color: color.ink, margin: 0, letterSpacing: "-0.01em", fontFamily: font.display },
  pageSubtitle: { fontSize: 12, color: color.grafiteLight, margin: "3px 0 0" },
  btnNovo:      { display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: color.brasaoDeep, color: "#FCF7EE", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 1px 2px rgba(122,85,40,0.3)" },
  btnSecNav:    { padding: "9px 16px", background: color.paper, color: color.ink, border: `1px solid ${color.paperLine}`, borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer" },

  content:    { flex: 1, overflowY: "auto", padding: "24px 28px" },
  erroBanner: { padding: "10px 14px", background: color.carimboSoft, border: `1px solid ${color.carimbo}`, borderRadius: 8, color: color.carimbo, fontSize: 13, marginBottom: 16 },
  loading:    { display: "flex", alignItems: "center", gap: 10, color: color.grafite, fontSize: 13, padding: 20 },
  spinner:    { width: 16, height: 16, border: `2px solid ${color.paperLine}`, borderTopColor: color.brasaoDeep, borderRadius: "50%", animation: "spin 0.7s linear infinite" },

  card:      { background: color.paperRaised, borderRadius: 10, border: `1px solid ${color.paperLine}`, overflow: "hidden", boxShadow: "0 1px 2px rgba(20,33,61,0.04)" },
  cardHead:  { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: `1px solid ${color.paper}`, fontSize: 13, fontWeight: 600, color: color.ink },
  cardCount: { background: color.paper, color: color.grafite, borderRadius: 99, fontSize: 11, fontWeight: 600, padding: "1px 8px", fontFamily: font.mono },
  vazio:     { padding: "32px 20px", color: color.grafiteLight, fontSize: 13, textAlign: "center", margin: 0 },

  statsRow: { display: "flex", gap: 14 },
  statIcon: { width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statValor: { fontSize: 30, fontWeight: 600, color: color.ink, letterSpacing: "-0.02em", marginTop: 10, fontFamily: font.mono },

  countdownCard:  { background: color.ink, borderRadius: 10, padding: 24, boxShadow: "0 1px 2px rgba(20,33,61,0.04)" },
  countdownLabel: { fontSize: 10.5, fontWeight: 600, color: color.brasao, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 16 },
  countdownTitulo:{ fontSize: 15, fontWeight: 600, color: "#F4F1E8", marginBottom: 4, lineHeight: 1.3, fontFamily: font.display },
  countdownMeta:  { fontSize: 11, color: "#8FA0BD", marginBottom: 20 },
  midRow:        { display: "flex", gap: 14 },
  countdownBoxes:{ display: "flex", alignItems: "center", gap: 6 },
  countBox:      { display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 14px", borderRadius: 8, minWidth: 58, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" },
  countBoxVal:   { fontSize: 26, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1, fontFamily: font.mono },
  countBoxLabel: { fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 5 },
  countSep:      { fontSize: 20, fontWeight: 600, color: "#3E4A6B", marginBottom: 12, fontFamily: font.mono },

  upcomingRow:  { display: "flex", gap: 12, padding: "16px 20px", overflowX: "auto" },
  upcomingCard: { minWidth: 140, maxWidth: 160, background: color.paper, borderRadius: 8, padding: "12px 14px", border: `1px solid ${color.paperLine}`, flexShrink: 0 },

  filtroBar:   { display: "flex", alignItems: "center", gap: 12, background: color.paperRaised, padding: "12px 16px", borderRadius: 10, border: `1px solid ${color.paperLine}`, flexWrap: "wrap" },
  filtroChips: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", flex: 1 },
  chip:        { display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" },
  chipDot:     { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },
  searchBox:   { display: "flex", alignItems: "center", gap: 6, background: color.paper, border: `1px solid ${color.paperLine}`, borderRadius: 7, padding: "6px 10px", minWidth: 220 },
  searchIcon:  { color: color.grafiteLight, display: "flex", flexShrink: 0 },
  searchInput: { flex: 1, border: "none", background: "none", fontSize: 12, color: color.ink, outline: "none" },
  searchClear: { display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: color.grafiteLight, padding: 0 },

  row:         { display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", borderBottom: `1px solid ${color.paper}` },
  dot:         { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  rowTitulo:   { fontSize: 13, fontWeight: 500, color: color.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  rowMeta:     { fontSize: 11, color: color.grafiteLight, marginTop: 1, fontFamily: font.mono },
  proc:        { fontWeight: 500, color: color.grafite },
  tag:         { fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, flexShrink: 0, letterSpacing: "0.02em" },
  statusBadge: { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, flexShrink: 0, letterSpacing: "0.02em" },
  acoes:       { display: "flex", gap: 2, flexShrink: 0 },
  btnAcao:     { display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "none", border: "none", borderRadius: 6, cursor: "pointer", color: color.grafiteLight },
  btnAcaoPerigo: { color: "#C97C6D" },
  readonlyTag: { fontSize: 10, fontStyle: "italic", color: color.grafiteLight, flexShrink: 0, whiteSpace: "nowrap" },

  alertaIcon:  { width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  diasBadge:   { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, flexShrink: 0, fontFamily: font.mono },

  overlay: { position: "fixed", inset: 0, background: "rgba(20,33,61,0.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal:   { background: color.paperRaised, borderRadius: 12, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(20,33,61,0.35)" },
};
