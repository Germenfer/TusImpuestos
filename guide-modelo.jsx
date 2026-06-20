// ───────────────────────────────────────────────────────────
// BLOQUES 3 y 4 · "Gobierno Mínimo" + "Bases"
//   Gobierno Mínimo: artículo de datos con índice lateral (scroll-spy):
//     coste hoy · reparto del gasto · empleo público · evolución
//     histórica · propuesta de Estado mínimo · fiscalidad · balance.
//   Bases: cuadrícula de bloques (01–14) + ficha de detalle.
// Reutiliza window.Segmented (definido en app.jsx) al renderizar.
// ───────────────────────────────────────────────────────────
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

// ── Formateadores locales (es-ES) ───────────────────────────
const esNum = (n, d = 0) =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const esPct = (n, d = 1) => esNum(n, d) + ' %';

// Datos macro del Estado español (último cierre disponible, 2024).
// Gasto total e indicadores: IGAE / Fedea (serie 1995–2024). Reparto por
// funciones (COFOG, % del gasto): IGAE 2024. Empleo público: BEPSAP, jul-2024.
const HOY = {
  pctPib: 45.5,        // gasto público / PIB (2024)
  gastoTotal: 725001,  // millones de euros (2024)
  empleados: 3043024,  // efectivos AAPP (jul-2024)
  pctOcupados: 17,     // ≈ % de la población ocupada
};

// Reparto del gasto por funciones — % del gasto público total (COFOG 2024).
// tone: 'bienestar' (Rallo lo devuelve al mercado) · 'nucleo' (lo conserva
// el Estado mínimo) · 'otros'. Ordenado de mayor a menor.
const REPARTO = [
  { label: 'Protección social',            pct: 41.0, tone: 'bienestar', desc: 'Pensiones (≈28% de todo el gasto), desempleo, dependencia y familia.' },
  { label: 'Salud',                        pct: 14.2, tone: 'bienestar', desc: 'Sanidad pública, hospitales, atención primaria y farmacia.' },
  { label: 'Servicios públicos generales', pct: 12.8, tone: 'otros',     desc: 'Alta administración, órganos de gobierno e intereses de la deuda.' },
  { label: 'Asuntos económicos',           pct: 11.2, tone: 'otros',     desc: 'Transporte, infraestructuras, energía, agricultura y ayudas a empresas.' },
  { label: 'Educación',                    pct: 9.1,  tone: 'bienestar', desc: 'Colegios, institutos, universidades y becas.' },
  { label: 'Orden público y seguridad',    pct: 3.9,  tone: 'nucleo',    desc: 'Policía, justicia, prisiones y bomberos.' },
  { label: 'Ocio, cultura y religión',     pct: 2.6,  tone: 'otros',     desc: 'Cultura, deporte y medios de comunicación públicos.' },
  { label: 'Medio ambiente',               pct: 2.1,  tone: 'otros',     desc: 'Residuos, aguas, saneamiento y conservación.' },
  { label: 'Defensa',                      pct: 2.0,  tone: 'nucleo',    desc: 'Fuerzas armadas y material militar.' },
  { label: 'Vivienda y serv. comunitarios',pct: 1.1,  tone: 'otros',     desc: 'Vivienda pública, urbanismo y alumbrado.' },
];

// Distribución del empleo público por nivel (BEPSAP, jul-2024).
const EMPLEO = [
  { label: 'Comunidades Autónomas',     pct: 61.4, desc: 'Sobre todo sanidad y educación.' },
  { label: 'Administración Local',      pct: 21.0, desc: 'Ayuntamientos y diputaciones.' },
  { label: 'Sector público estatal',    pct: 17.6, desc: 'AGE, Seguridad Social y militares.' },
];

// Evolución del gasto público / PIB en España. Anclas históricas
// (Comín, Prados de la Escosura, IGAE, Eurostat/Funcas). Cifras del
// siglo XIX–XX son estimaciones de contabilidad histórica.
const EVOLUCION = [
  { year: 1900, pct: 11,   note: null },
  { year: 1960, pct: 19,   note: null },
  { year: 1975, pct: 24,   note: 'Transición' },
  { year: 1985, pct: 40,   note: 'Estado del bienestar' },
  { year: 1993, pct: 47,   note: null },
  { year: 2007, pct: 39,   note: null },
  { year: 2009, pct: 46,   note: null },
  { year: 2019, pct: 42.1, note: null },
  { year: 2020, pct: 52.4, note: 'COVID-19' },
  { year: 2024, pct: 45.5, note: null },
];

// Presupuesto de un Estado mínimo (Rallo), en % del PIB. Suma ≈ 5%.
const RALLO_PRES = [
  { label: 'Justicia, seguridad y defensa', pct: 2.2, desc: 'El núcleo del Estado de Derecho, racionalizado y en parte externalizado (≈22.000 M€ frente a 35.000 M€ actuales).' },
  { label: 'Asistencia social subsidiaria', pct: 2.0, desc: 'Red de última instancia. Horquilla del 1% al 4% del PIB según el ciclo económico.' },
  { label: 'Burocracia y servicios generales', pct: 0.5, desc: '≈5.000 M€ (frente a ≈60.000 M€ hoy). Sin partida de intereses: la deuda se amortiza durante la transición.' },
  { label: 'Infraestructuras e I+D básica', pct: 0.3, desc: 'Inversión residual y subsidiaria; el resto se financia con tasas y peajes.' },
];
const RALLO_TOTAL_PIB = RALLO_PRES.reduce((s, p) => s + p.pct, 0); // 5.0

// Plantilla pública en el Estado mínimo (Rallo): ≈400.000 frente a ≈3 M.
const RALLO_EMPLEO = [
  { label: 'Defensa', n: 150000 },
  { label: 'Seguridad y prisiones', n: 135000 },
  { label: 'Servicios centrales', n: 70000 },
  { label: 'Justicia', n: 45000 },
];
const RALLO_EMPLEO_TOTAL = RALLO_EMPLEO.reduce((s, p) => s + p.n, 0); // 400.000

// ── Helpers de visualización ────────────────────────────────
const TONE_LABEL = {
  bienestar: 'Estado del bienestar',
  nucleo: 'Núcleo que conserva el Estado mínimo',
  otros: 'Otras funciones',
};

// Barra proporcional reutilizable (track + relleno + valor).
function GMBar({ frac, tone, children }) {
  return (
    <div className="gm-bar">
      <div className={`gm-bar-fill tone-${tone || 'otros'}`} style={{ width: `${Math.max(1.5, frac * 100)}%` }} />
      {children}
    </div>
  );
}

// Pequeño conmutador segmentado local (estilo del sitio).
function MiniSeg({ value, onChange, options }) {
  return (
    <div className="gm-seg" role="tablist">
      {options.map((o) => (
        <button key={o.id} role="tab" aria-selected={value === o.id}
          className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── 3·1 — Tira de cifras: el coste del Estado hoy ───────────
function CosteStrip() {
  return (
    <div className="gm-statstrip">
      <div className="gm-stat">
        <span className="gm-stat-num numerals">{esPct(HOY.pctPib)}</span>
        <span className="gm-stat-lbl">del PIB es gasto público</span>
        <span className="gm-stat-sub">Casi uno de cada dos euros que produce el país pasa por las administraciones.</span>
      </div>
      <div className="gm-stat">
        <span className="gm-stat-num numerals">{esNum(HOY.gastoTotal)}</span>
        <span className="gm-stat-lbl">millones de euros al año</span>
        <span className="gm-stat-sub">Gasto consolidado de todas las administraciones en 2024.</span>
      </div>
      <div className="gm-stat">
        <span className="gm-stat-num numerals">3,0 M</span>
        <span className="gm-stat-lbl">empleados públicos</span>
        <span className="gm-stat-sub">≈ {HOY.pctOcupados}% de los ocupados. El Estado es el mayor empleador del país.</span>
      </div>
    </div>
  );
}

// ── 3·2 — Reparto del gasto por funciones ───────────────────
function RepartoGasto() {
  const [mode, setMode] = useStateM('gasto'); // 'gasto' | 'pib'
  const maxPct = REPARTO[0].pct; // protección social manda
  const valFor = (p) => mode === 'gasto' ? p.pct : (p.pct / 100) * HOY.pctPib;
  const valStr = (p) => mode === 'gasto'
    ? esPct(p.pct, 1)
    : esPct((p.pct / 100) * HOY.pctPib, 1);

  return (
    <div className="gm-comp">
      <div className="gm-comp-head">
        <div className="gm-legend">
          <span className="gm-leg-item"><i className="dot tone-bienestar" /> {TONE_LABEL.bienestar}</span>
          <span className="gm-leg-item"><i className="dot tone-nucleo" /> {TONE_LABEL.nucleo}</span>
          <span className="gm-leg-item"><i className="dot tone-otros" /> {TONE_LABEL.otros}</span>
        </div>
        <MiniSeg value={mode} onChange={setMode}
          options={[{ id: 'gasto', label: '% del gasto' }, { id: 'pib', label: '% del PIB' }]} />
      </div>

      <div className="gm-comp-rows">
        {REPARTO.map((p) => (
          <div className="gm-comp-row" key={p.label}>
            <div className="gm-comp-info">
              <span className="gm-comp-label">{p.label}</span>
              <span className="gm-comp-desc">{p.desc}</span>
            </div>
            <GMBar frac={valFor(p) / (mode === 'gasto' ? maxPct : (maxPct / 100) * HOY.pctPib)} tone={p.tone} />
            <div className="gm-comp-val">
              <span className="numerals v">{valStr(p)}</span>
              <span className="numerals e">{esNum(Math.round((p.pct / 100) * HOY.gastoTotal))} M€</span>
            </div>
          </div>
        ))}
      </div>

      <p className="gm-foot">
        El <b>Estado del bienestar</b> —pensiones, sanidad y educación— concentra cerca de <b className="numerals">dos tercios</b> del
        gasto. Son justamente las funciones que la propuesta liberal devuelve, de forma gradual, a la provisión privada.
      </p>
    </div>
  );
}

// ── 3·3 — El Estado como empleador ──────────────────────────
function EmpleoPublico() {
  return (
    <div className="gm-employer">
      <div className="gm-employer-lead">
        <span className="gm-big numerals">{esNum(HOY.empleados)}</span>
        <span className="gm-big-sub">efectivos en las administraciones públicas (julio 2024), tras superar por primera vez los tres millones.</span>
      </div>
      <div className="gm-employer-bars">
        {EMPLEO.map((e) => (
          <div className="gm-emp-row" key={e.label}>
            <div className="gm-emp-top">
              <span className="gm-emp-label">{e.label}</span>
              <span className="numerals gm-emp-pct">{esPct(e.pct)}</span>
            </div>
            <GMBar frac={e.pct / 100} tone="ink" />
            <span className="gm-emp-desc">{e.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 3·4 — Evolución histórica (gráfico SVG) ─────────────────
function EvolucionChart() {
  const W = 760, H = 300;
  const padL = 38, padR = 18, padT = 22, padB = 34;
  const xa = padL, xb = W - padR, ya = H - padB, yb = padT;
  const minY = 1900, maxY = 2024, maxP = 55;
  const sx = (yr) => xa + ((yr - minY) / (maxY - minY)) * (xb - xa);
  const sy = (p) => ya - (p / maxP) * (ya - yb);

  const pts = EVOLUCION.map((d) => [sx(d.year), sy(d.pct)]);
  const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = `${line} L${xb} ${ya} L${xa} ${ya} Z`;
  const grid = [0, 10, 20, 30, 40, 50];
  const rallo = sy(5);

  return (
    <div className="gm-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
        aria-label="Evolución del gasto público sobre PIB en España, 1900–2024">
        <defs>
          <linearGradient id="gmArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--hi)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--hi)" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {grid.map((g) => (
          <g key={g}>
            <line x1={xa} y1={sy(g)} x2={xb} y2={sy(g)} className="gm-grid" />
            <text x={xa - 6} y={sy(g) + 3} textAnchor="end" className="gm-axis">{g}</text>
          </g>
        ))}

        {/* Regla de oro de Rallo: 5% del PIB */}
        <line x1={xa} y1={rallo} x2={xb} y2={rallo} className="gm-rallo-line" />
        <text x={xb} y={rallo - 6} textAnchor="end" className="gm-rallo-tag">regla de oro · Estado mínimo 5%</text>

        <path d={area} fill="url(#gmArea)" />
        <path d={line} className="gm-line" fill="none" />

        {EVOLUCION.map((d) => {
          const cx = sx(d.year), cy = sy(d.pct);
          const anchor = cx > W * 0.82 ? 'end' : cx < W * 0.18 ? 'start' : 'middle';
          return (
            <g key={d.year}>
              <circle cx={cx} cy={cy} r={d.note ? 4 : 2.8} className={`gm-dot${d.note ? ' key' : ''}`} />
              <text x={cx} y={ya + 16} textAnchor="middle" className="gm-axis">{d.year}</text>
              {d.note && (
                <text x={cx} y={Math.max(16, cy - 11)} textAnchor={anchor} className="gm-note">
                  {d.note} · {esNum(d.pct, d.pct % 1 ? 1 : 0)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="gm-foot">
        Hasta 1913 el gasto público se mantuvo por debajo del 10–12% del PIB. La expansión es un fenómeno del último siglo:
        de <b className="numerals">≈24%</b> en 1975 saltó a <b className="numerals">≈40%</b> en una década y tocó techo en el
        <b className="numerals"> 52,4%</b> durante la pandemia. La propuesta liberal devolvería el Estado a su tamaño histórico.
      </p>
    </div>
  );
}

// ── 3·5 — La propuesta: un Estado del 5% ────────────────────
// Barra comparativa grande (antes / después) sobre una escala común.
function BigCut({ label, hoy, rallo, max, fmt, cut }) {
  return (
    <div className="gm-cut">
      <div className="gm-cut-label">{label}</div>
      <div className="gm-cut-rows">
        <div className="gm-cut-row">
          <span className="gm-cut-tag">Hoy</span>
          <div className="gm-bar tall">
            <div className="gm-bar-fill tone-ink" style={{ width: `${(hoy / max) * 100}%` }} />
          </div>
          <span className="numerals gm-cut-val">{fmt(hoy)}</span>
        </div>
        <div className="gm-cut-row">
          <span className="gm-cut-tag rallo">Mínimo</span>
          <div className="gm-bar tall">
            <div className="gm-bar-fill tone-good" style={{ width: `${Math.max(1.4, (rallo / max) * 100)}%` }} />
          </div>
          <span className="numerals gm-cut-val">{fmt(rallo)}</span>
        </div>
      </div>
      <div className="gm-cut-delta numerals">{cut}</div>
    </div>
  );
}

function PropuestaMinimo() {
  const maxPart = RALLO_PRES[0].pct;
  return (
    <div className="gm-minimo">
      <div className="gm-cuts">
        <BigCut label="Tamaño del Estado" hoy={45.5} rallo={5} max={55}
          fmt={(v) => esPct(v, v % 1 ? 1 : 0)} cut="−90%" />
        <BigCut label="Empleados públicos" hoy={3.0} rallo={0.4} max={3.2}
          fmt={(v) => v >= 1 ? `${esNum(v, 1)} M` : `${esNum(v * 1000)} mil`} cut="−87%" />
      </div>

      <div className="gm-budget">
        <div className="gm-budget-head">
          <span className="gm-budget-eyebrow">Presupuesto de un Estado mínimo</span>
          <span className="gm-budget-total numerals">≈ {esNum(RALLO_TOTAL_PIB, 0)}% del PIB</span>
        </div>
        <div className="gm-budget-rows">
          {RALLO_PRES.map((p) => (
            <div className="gm-budget-row" key={p.label}>
              <div className="gm-comp-info">
                <span className="gm-comp-label">{p.label}</span>
                <span className="gm-comp-desc">{p.desc}</span>
              </div>
              <GMBar frac={p.pct / maxPart} tone="good" />
              <span className="numerals gm-comp-val single">{esPct(p.pct, 1)} PIB</span>
            </div>
          ))}
        </div>
        <p className="gm-foot">
          Defensa apenas cambia; seguridad y justicia se racionalizan; la maquinaria administrativa pasa de unos 60.000 a 5.000 M€.
          El Estado del bienestar deja de financiarse por la fuerza, salvo una red subsidiaria. Si la asistencia social se volviera
          innecesaria y se externalizaran más servicios, el Estado podría bajar incluso al <b className="numerals">≈1,5% del PIB</b>.
        </p>
      </div>
    </div>
  );
}

// ── 3·6 — Cómo se financiaría ───────────────────────────────
function Fiscalidad() {
  return (
    <div className="gm-finance">
      <div className="gm-fin-card">
        <span className="gm-fin-k numerals">≤ 6%</span>
        <span className="gm-fin-t">Impuesto general único</span>
        <p>Un tipo proporcional sobre la renta <i>o</i> el consumo, sin deducciones ni exenciones. Recaudaría entre
          40.000 y 50.000 M€ y sustituiría a toda la maraña tributaria actual.</p>
      </div>
      <div className="gm-fin-card">
        <span className="gm-fin-k numerals">0,5%</span>
        <span className="gm-fin-t">Tasas (% del PIB)</span>
        <p>Peajes en autovías, tasas judiciales y cobros por servicios de seguridad extraordinarios. Quien usa, paga;
          ≈5.000 M€.</p>
      </div>
      <div className="gm-fin-card pareto">
        <span className="gm-fin-k">Nadie<br />pierde</span>
        <span className="gm-fin-t">Reforma «Pareto-superior»</span>
        <p>Diseñada para que <b>todo el mundo</b> pague menos que antes: no hay damnificados por la redistribución de
          la carga fiscal, solo ganadores.</p>
      </div>
    </div>
  );
}

// ── 3·7 — Balance: hoy frente al mínimo ─────────────────────
const BALANCE = [
  { dim: 'Tamaño del Estado',     hoy: '≈ 45,5% del PIB',                       min: '≈ 5% del PIB (regla de oro)' },
  { dim: 'Empleados públicos',    hoy: '≈ 3,0 millones',                        min: '≈ 400.000' },
  { dim: 'Fiscalidad',            hoy: 'IRPF, IVA, SS, patrimonio, sociedades…', min: 'Impuesto único ≤6% + tasas' },
  { dim: 'Bienestar (sanidad, educación, pensiones)', hoy: 'Provisión coactiva', min: 'Provisión privada + red subsidiaria' },
  { dim: 'Intereses de la deuda', hoy: '≈ 4% del PIB',                          min: 'Sin partida (amortizada en la transición)' },
  { dim: 'Estructura',            hoy: 'Centralizada y europeizada',            min: 'Descentralizada; gobierno central ≤2,5% PIB' },
];

function BalanceTable() {
  return (
    <div className="gm-balance">
      <div className="gm-bal-headrow">
        <span />
        <span className="gm-bal-h hoy">Hiperestado actual</span>
        <span className="gm-bal-h min">Estado mínimo · Rallo</span>
      </div>
      {BALANCE.map((b) => (
        <div className="gm-bal-row" key={b.dim}>
          <span className="gm-bal-dim">{b.dim}</span>
          <span className="gm-bal-hoy">{b.hoy}</span>
          <span className="gm-bal-min">{b.min}</span>
        </div>
      ))}
    </div>
  );
}

// ── Artículo con índice lateral (scroll-spy) ────────────────
const GM_SECTIONS = [
  { id: 'g-coste',     nav: 'El coste hoy',     title: 'El coste del Estado hoy' },
  { id: 'g-reparto',   nav: 'En qué se gasta',  title: '¿En qué se gasta cada euro?' },
  { id: 'g-empleo',    nav: 'Empleo público',   title: 'El Estado como empleador' },
  { id: 'g-evolucion', nav: 'Cómo llegamos aquí', title: 'Un siglo de crecimiento' },
  { id: 'g-minimo',    nav: 'La propuesta: 5%', title: 'La propuesta: un Estado del 5%' },
  { id: 'g-fiscalidad',nav: 'Cómo se financia', title: '¿Cómo se financiaría?' },
  { id: 'g-balance',   nav: 'Hoy vs mínimo',    title: 'Hoy frente al mínimo' },
];

const GM_INTRO = {
  'g-coste': 'Antes de discutir qué debería hacer el Estado, conviene medir qué hace y cuánto cuesta. Estas son las cifras del sector público español hoy.',
  'g-reparto': 'No todo el gasto pesa lo mismo. Repartido por funciones, se ve dónde va de verdad el dinero —y qué partidas sostienen el Estado del bienestar.',
  'g-empleo': 'El gasto también es gente. El reparto de la plantilla pública entre niveles de administración revela dónde se concentra el Estado.',
  'g-evolucion': 'El Estado actual no es la norma histórica, sino una anomalía reciente. Así ha crecido su peso sobre la economía en poco más de un siglo.',
  'g-minimo': 'Frente al hiperestado, Rallo propone un Estado limitado a defensa, seguridad, justicia y una red social subsidiaria: en torno al 5% del PIB.',
  'g-fiscalidad': 'Un Estado pequeño necesita pocos impuestos. Toda la maraña fiscal se sustituiría por un único tributo de tipo reducido más algunas tasas.',
  'g-balance': 'Dos modelos de país, lado a lado.',
};

function GMArticle() {
  const [active, setActive] = useStateM(GM_SECTIONS[0].id);

  useEffectM(() => {
    if (!('IntersectionObserver' in window)) return;
    const nodes = GM_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: '-88px 0px -65% 0px', threshold: 0 });
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const BODY = {
    'g-coste': <CosteStrip />,
    'g-reparto': <RepartoGasto />,
    'g-empleo': <EmpleoPublico />,
    'g-evolucion': <EvolucionChart />,
    'g-minimo': <PropuestaMinimo />,
    'g-fiscalidad': <Fiscalidad />,
    'g-balance': <BalanceTable />,
  };

  return (
    <div className="modelo-article">
      <nav className="modelo-index">
        <span className="idx-label">En este bloque</span>
        {GM_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'on' : ''}>{s.nav}</a>
        ))}
      </nav>
      <div className="modelo-body gm-body">
        {GM_SECTIONS.map((s, i) => (
          <article key={s.id} id={s.id}>
            <div className="gm-art-head">
              <span className="gm-art-n numerals">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
            </div>
            <p className="gm-art-intro">{GM_INTRO[s.id]}</p>
            {BODY[s.id]}
          </article>
        ))}
      </div>
    </div>
  );
}

function GobiernoSection() {
  return (
    <section className="guide-section" id="gobierno">
      <div className="shell">
        <div className="guide-head">
          <div className="eyebrow">bloque 03 · gobierno mínimo</div>
          <h2>El hiperestado actual frente al <mark>mínimo</mark></h2>
          <p>Qué hace hoy el Estado español, cuánto cuesta, cuánta gente emplea y cómo ha crecido hasta aquí —y qué
            conservaría un gobierno mínimo. El armazón del modelo, de las cifras al presupuesto.</p>
        </div>

        <GMArticle />
      </div>
    </section>
  );
}

// ── Bloques 01–14 (Bases) ───────────────────────────────────
// Plantilla repetible por bloque: idea · problema · propuesta · datos · objeción.
// 👉 SUSTITUYE los textos de marcador de posición por tu contenido real.
const PH = {
  problem: 'Texto de marcador de posición: descripción del problema actual en este sector.',
  proposal: 'Texto de marcador de posición: la propuesta liberal para este sector.',
  data: [
    { k: '00 %', v: 'Dato clave de marcador de posición.' },
    { k: '0.0 B€', v: 'Segundo dato de marcador de posición.' },
  ],
  objection: { q: '«Objeción habitual de marcador de posición.»', a: 'Respuesta de marcador de posición a la objeción.' },
};
const sec = (n, title, idea, special = false) => ({ n, title, idea, special, ...PH });

const SECTORS = [
  {
  n: 1,
  title: 'Estado de Derecho',
  idea: 'El Estado solo debe garantizar un marco básico de propiedad y libertades; el resto del derecho lo producen contratos y arbitrajes privados, no el legislador.',
  special: false,
  problem: 'Hoy el Estado monopoliza la creación e interpretación de las normas y regula hasta los detalles más nimios de la vida privada; la legislación publicada cada año no deja de crecer. El derecho penal persigue delitos sin víctima —drogas, juego, prostitución voluntaria— y España tiene más agentes de seguridad por habitante que ningún país de la OCDE. Defensa, seguridad y justicia cuestan unos 35.000 M€.',
  proposal: 'Casi todo el derecho civil y laboral vuelve a la sociedad: lo regulan contratos voluntarios y tribunales de arbitraje privados. El Estado solo redacta unas pocas normas básicas, estables y poco técnicas que protegen propiedad y libertades, y reserva tribunales y policía para lo que el mercado no cubra. El derecho penal pasa a centrarse en resarcir a la víctima; el ejército, solo defensivo. Total: unos 22.000 M€.',
  data: [
    { k: '35.000 M€', v: 'Gasto actual en defensa, seguridad y justicia.' },
    { k: '22.000 M€', v: 'Coste del Estado de Derecho mínimo, un 35 % menos.' },
    { k: '5,2', v: 'Agentes de seguridad por 1.000 habitantes: récord de la OCDE.' },
    { k: '34,3 %', v: 'Órganos judiciales solo civiles o de lo social, prescindibles.' },
  ],
  objection: {
    q: '«Si el derecho lo escriben los contratos y la justicia la dan árbitros privados, ¿no acabará imponiéndose la ley del más fuerte?»',
    a: 'No: el Estado mantiene el monopolio de la fuerza para todo lo que no sea voluntario —la coacción de una persona sobre otra— y conserva tribunales subsidiarios cuando las partes no pactan un árbitro. El arbitraje solo rige acuerdos libremente aceptados. Unas normas básicas, estables y previsibles dan más seguridad jurídica que la actual orgía legislativa.',
  },
  },
  {
  n: 2,
  title: 'Servicios municipales',
  idea: 'Las ciudades no necesitan ayuntamientos estatales: son comunidades de propietarios que pueden gestionar sus servicios comunes mediante pacto voluntario y competencia entre municipios.',
  special: false,
  problem: 'Hoy las ciudades son subdivisiones administrativas del Estado: ayuntamientos impuestos, no pactados entre sus propietarios. En realidad una ciudad es una copropiedad incompleta cuya gestión desprecia a los vecinos. Su gobierno acaba copado por oligarquías políticas que deciden por su cuenta, financiándose con un IBI que no es más que una cuota comunitaria mal formulada y obligatoria.',
  proposal: 'Rallo plantea devolver las ciudades a la sociedad civil por tres vías. Primera: permitir crear ciudades privadas desde cero, como las comunidades de propietarios estadounidenses o las ciudades libres de Honduras. Segunda: reconocer el derecho de división comunal, para que barrios o distritos puedan separarse y gestionar sus espacios comunes vía convenio regulador. Tercera: externalizar a empresas privadas todos los servicios municipales, no sólo basuras o limpieza.',
  data: [
    { k: '62 M', v: 'estadounidenses viven en comunidades privadas de propietarios' },
    { k: '−21 %', v: 'coste municipal en Sandy Springs frente a su entorno' },
    { k: '14.470 M€', v: 'recaudación del IBI en 2024, una cuota comunitaria encubierta' },
    { k: '15.000–20.000 M€', v: 'gasto municipal que mantendrían las ciudades privadas (est. Rallo)' },
  ],
  objection: {
    q: '«Si cualquier barrio puede separarse, la ciudad se fragmentaría en un caos: ¿quién mantendría el alcantarillado o las calles de paso comunes?»',
    a: 'El convenio regulador de cada división fija exactamente eso: servidumbres de paso y gestión conjunta de los bienes indivisibles, como el alcantarillado. Y la fragmentación tiene freno propio: pasado cierto tamaño, esas obligaciones encarecen tanto separarse que nadie sigue subdividiendo.',
  },
  },
  sec(3, 'Medio ambiente', 'Idea central de marcador de posición.'),
  sec(4, 'Infraestructuras', 'Idea central de marcador de posición.'),
  sec(5, 'Moneda y banca', 'Idea central de marcador de posición.'),
  sec(6, 'Promoción de empresas', 'Idea central de marcador de posición.'),
  sec(7, 'Mercado de trabajo', 'Idea central de marcador de posición.'),
  sec(8, 'Mercado eléctrico', 'Idea central de marcador de posición.'),
  sec(9, 'I+D', 'Idea central de marcador de posición.'),
  sec(10, 'Educación', 'Idea central de marcador de posición.'),
  sec(11, 'Cultura y arte', 'Idea central de marcador de posición.'),
  sec(12, 'Pensiones', 'Idea central de marcador de posición.'),
  sec(13, 'Sanidad', 'Idea central de marcador de posición.'),
  sec(14, 'Asistencia social', 'Idea central de marcador de posición.'),
];

function SectorDetail({ data, onClose }) {
  return (
    <div className="sector-detail">
      <div className="sd-head">
        <div>
          <div className="sd-eyebrow">Bloque {String(data.n).padStart(2, '0')}</div>
          <h3 className="sd-title">{data.title}</h3>
        </div>
        <button className="sd-close" onClick={onClose} aria-label="Cerrar ficha">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>
      <p className="sd-idea">{data.idea}</p>
      <div className="sd-grid">
        <div className="sd-block problem">
          <h4>El problema actual</h4>
          <p>{data.problem}</p>
        </div>
        <div className="sd-block proposal">
          <h4>La propuesta liberal</h4>
          <p>{data.proposal}</p>
        </div>
        <div className="sd-block" style={{ gridColumn: '1 / -1' }}>
          <h4>Datos clave</h4>
          <ul className="sd-data">
            {data.data.map((d, i) =>
            <li key={i}><span className="k numerals">{d.k}</span><span>{d.v}</span></li>
            )}
          </ul>
        </div>
        <div className="sd-objection">
          <h4>Objeciones y respuesta</h4>
          <p className="q">{data.objection.q}</p>
          <p className="a">{data.objection.a}</p>
        </div>
      </div>
    </div>);

}

function SectoresGrid() {
  const [openN, setOpenN] = useStateM(null);
  const selected = SECTORS.find((s) => s.n === openN) || null;
  return (
    <div>
      <div className="sector-grid">
        {SECTORS.map((s) =>
        <button
          key={s.n}
          className={`sector-card${s.special ? ' special' : ''}${openN === s.n ? ' active' : ''}`}
          onClick={() => setOpenN((cur) => cur === s.n ? null : s.n)}>
            <span className="sc-num numerals">{String(s.n).padStart(2, '0')}</span>
            <span className="sc-title">{s.title}</span>
            <span className="sc-idea">{s.idea}</span>
          </button>
        )}
      </div>
      {selected && <SectorDetail data={selected} onClose={() => setOpenN(null)} />}
    </div>);

}

function BasesSection() {
  return (
    <section className="guide-section" id="bases">
      <div className="shell">
        <div className="guide-head">
          <div className="eyebrow">bloque 04 · las bases</div>
          <h2>Las <mark>14 bases</mark> del modelo</h2>
          {/* 👉 SUSTITUYE este intro por tu texto. */}
          <p>El recorrido bloque a bloque. Pulsa cualquiera de las 14 bases para ver el problema actual, la propuesta liberal, los datos clave y las objeciones.</p>
        </div>

        <SectoresGrid />
      </div>
    </section>);

}

window.SectorDetail = SectorDetail;
window.GobiernoSection = GobiernoSection;
window.BasesSection = BasesSection;
