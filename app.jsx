// tus impuestos — main app
// React UI for V1 split layout, wired to the calculator.js engine.

const { useState, useMemo, useEffect, useRef } = React;
const TC = window.TaxCalc;
const calculate = TC.calculate;
const calculateEffective = TC.calculateEffective;
const REGION_LIST = TC.REGIONS;
const fmtEur = TC.fmtEur;
const fmtEur2 = TC.fmtEur2;
const fmtPct = TC.fmtPct;

// ─── Animated number counter ────────────────────────────────
function AnimatedNumber({ value, formatter = fmtEur, duration = 500 }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const from = fromRef.current;
    const to = value;
    const start = performance.now();
    startRef.current = start;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (to - from) * eased;
      setDisplay(v);
      if (t < 1) rafRef.current = requestAnimationFrame(step);else
      fromRef.current = to;
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <>{formatter(display)}</>;
}

// ─── Field primitives ───────────────────────────────────────
function NumberField({ label, value, onChange, suffix, hint, big = false, accent = false, min = 0, max = 9999999, step = 100 }) {
  const [raw, setRaw] = useState(String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setRaw(String(value));
  }, [value]);

  return (
    <div className="field">
      <label>{label}</label>
      <div className={`control${accent ? ' accent' : ''}`}>
        <input
          type="number"
          className={`numerals${big ? ' big' : ''}`}
          value={raw}
          min={min}
          max={max}
          step={step}
          onChange={(e) => setRaw(e.target.value)}
          onFocus={() => { focused.current = true; }}
          onBlur={(e) => {
            focused.current = false;
            const n = e.target.value === '' ? min : Math.max(min, Math.min(max, +e.target.value || min));
            onChange(n);
            setRaw(String(n));
          }} />
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
      {hint && <div className="hint">{hint}</div>}
    </div>);

}

function SelectField({ label, value, onChange, options, hint }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="control">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <span className="chev">▾</span>
      </div>
      {hint && <div className="hint">{hint}</div>}
    </div>);

}

function Segmented({ value, onChange, options }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) =>
      <button
        key={o.id}
        role="tab"
        aria-selected={value === o.id}
        className={value === o.id ? 'on' : ''}
        onClick={() => onChange(o.id)}>
        {o.label}</button>
      )}
    </div>);

}

// ─── Slider ─────────────────────────────────────────────────
function SliderField({ label, value, onChange, min = 0, max = 100, step = 1, format, suggested }) {
  const fmt = format || ((v) => v);
  return (
    <div className="slider-field">
      <div className="head">
        <span className="label">{label}</span>
        <span className="val numerals">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)} />
      
      {suggested != null && Math.abs(suggested - value) > 0.001 &&
      <div className="head" style={{ marginTop: -4 }}>
          <span className="suggested">Sugerido por tu nivel de ingresos: {fmt(suggested)}</span>
          <button className="btn ghost" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => onChange(suggested)}>Usar sugerido</button>
        </div>
      }
    </div>);

}

// ─── Toggle row ─────────────────────────────────────────────
function ToggleRow({ on, onChange, text, sub }) {
  return (
    <div className={`toggle-row${on ? ' on' : ''}`} onClick={() => onChange(!on)} role="switch" aria-checked={on}>
      <div>
        <div className="text">{text}</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
      <div className="sw"></div>
    </div>);

}

// ─── App ────────────────────────────────────────────────────
function App() {
  const [input, setInput] = useState({
    employmentType: 'asalariado',
    gross: 35000,
    payments: 14,
    region: 'madrid',
    age: 32,
    status: 'soltero',
    children: 0,
    pension: 0,
    disability: 'none'
  });

  const [lifestyle, setLifestyle] = useState({
    enabled: true,
    spendRate: null, // null = use suggested
    ownsHome: false,
    homeValue: 250000,
    mortgage: 0,
    financialAssets: 0
  });

  const set = (k, v) => setInput((s) => ({ ...s, [k]: v }));
  const setL = (k, v) => setLifestyle((s) => ({ ...s, [k]: v }));

  const result = useMemo(() => calculate(input), [input]);
  const effective = useMemo(() => {
    if (!lifestyle.enabled) {
      // "Pass-through": effective = net, no extra subtractions
      const net = result.net || 0;
      const gross = result.gross || 0;
      return {
        spendRate: 0, suggestedSpendRate: TC.suggestedSpendRate ? TC.suggestedSpendRate(net) : 0,
        spending: 0, vat: 0, ibi: 0, patrimonio: 0,
        consumption: 0, property: 0,
        totalExtra: 0, effective: net, effectiveMonthly: net / 12,
        totalTaxes: (result.irpf || 0) + (result.ss || 0),
        totalRate: result.totalRate || 0,
        totalWealth: 0, taxableWealth: 0, wealthBonif: 0
      };
    }
    const ls = { ...lifestyle };
    if (ls.spendRate == null) ls.spendRate = undefined;
    return calculateEffective(result, ls, input.region);
  }, [result, lifestyle, input.region]);

  // Currently-applied spend rate (numeric, after default substitution)
  const activeSpendRate = effective.spendRate || (TC.suggestedSpendRate ? TC.suggestedSpendRate(result.net) : 0.8);
  const suggestedSR = effective.suggestedSpendRate;

  // Percentages for the breakdown bar (guard against zero gross)
  const g = input.gross > 0 ? input.gross : 1;
  const pctEffective = Math.max(0, effective.effective / g * 100);
  const pctVat = Math.max(0, effective.vat / g * 100);
  const pctProp = Math.max(0, effective.property / g * 100);
  const pctIrpf = Math.max(0, result.irpf / g * 100);
  const pctSs = Math.max(0, result.ss / g * 100);

  const isAuto = input.employmentType === 'autonomo';
  const ssLabel = isAuto ? 'Cuota Autónomos' : 'Seguridad Social';

  return (
    <>
      {/* HEADER */}
      <header className="site-header">
        <div className="shell row">
          <a className="brand" href="#">
            <span className="dot"></span>
            Tus Impuestos
            <span className="year">2026</span>
          </a>
          <nav className="nav">
            <a href="#calc">Calculadora</a>
            <a href="#como">Cómo se calcula</a>
            <a href="#preguntas">Preguntas</a>
          </nav>
          <div className="lang">
            <button className="on">ES</button>
            <button>EN</button>
          </div>
        </div>
      </header>

      <main className="shell">
        {/* HERO */}
        <section className="hero">
          <span className="eyebrow">IRPF + IVA + Patrimonio · España · 2026</span>
          <h1>Salario: Tú lo ganas. <mark>El Estado te lo roba.</mark> Haz los números.</h1>
          <p>Tu salario bruto es como una tarta de la cual te van robando cachos hasta que llegas a casa. Una vez allí te queda el salario neto.  Pero, cuando te pones a comerla, te das cuenta de que no todo te llega a la boca. Este es el neto efectivo. ¿A qué va cada gajo de la tarta? ¿De cuánto dinero extra podrías disponer si no te lo robaran?</p>
        </section>

        {/* CALCULATOR */}
        <section className="calc" id="calc">
          {/* LEFT — FORM */}
          <div>
            <div className="card">
              <div className="section-label"><span className="num">1</span>Situación base</div>
              <Segmented
                value={input.employmentType}
                onChange={(v) => set('employmentType', v)}
                options={[
                { id: 'asalariado', label: 'Asalariado' },
                { id: 'autonomo', label: 'Autónomo' }]
                } />
              

              <div style={{ height: 18 }}></div>

              <div className="grid-3-2">
                <NumberField
                  label="Salario bruto anual"
                  value={input.gross}
                  onChange={(v) => set('gross', v)}
                  suffix="€"
                  big accent
                  step={500} />
                
                <SelectField
                  label="Nº de pagas"
                  value={String(input.payments)}
                  onChange={(v) => set('payments', +v)}
                  options={[
                  { id: '12', label: '12 pagas' },
                  { id: '14', label: '14 pagas' }]
                  }
                  hint={isAuto ? 'No aplica a autónomos' : null} />
                
              </div>

              <div style={{ height: 14 }}></div>

              <div className="grid-2">
                <SelectField
                  label="Comunidad autónoma"
                  value={input.region}
                  onChange={(v) => set('region', v)}
                  options={REGION_LIST} />
                
                <NumberField
                  label="Edad"
                  value={input.age}
                  onChange={(v) => set('age', v)}
                  min={18} max={100} step={1} />
                
              </div>

              <div style={{ height: 14 }}></div>

              <div className="grid-2">
                <SelectField
                  label="Estado civil"
                  value={input.status}
                  onChange={(v) => set('status', v)}
                  options={[
                  { id: 'soltero', label: 'Soltero/a' },
                  { id: 'casado', label: 'Casado/a' },
                  { id: 'divorciado', label: 'Divorciado/a' },
                  { id: 'viudo', label: 'Viudo/a' }]
                  } />
                
                <NumberField
                  label="Hijos < 25 años"
                  value={input.children}
                  onChange={(v) => set('children', v)}
                  min={0} max={10} step={1} />
                
              </div>
            </div>

            <div className="card">
              <details className="advanced" open>
                <summary>
                  <span><span className="section-label" style={{ margin: 0, display: 'inline-flex' }}><span className="num">2</span>Deducciones (opcional)</span></span>
                  <span className="caret">›</span>
                </summary>
                <div>
                  <div className="grid-2">
                    <NumberField
                      label="Aportación a plan de pensiones"
                      value={input.pension}
                      onChange={(v) => set('pension', v)}
                      suffix="€/año"
                      hint="Máx. deducible: 1.500 €/año"
                      step={100} max={1500} />
                    
                    <SelectField
                      label="Discapacidad"
                      value={input.disability}
                      onChange={(v) => set('disability', v)}
                      options={[
                      { id: 'none', label: 'Ninguna' },
                      { id: 'mild', label: '33 – 65%' },
                      { id: 'severe', label: 'Superior al 65%' }]
                      } />
                    
                  </div>
                </div>
              </details>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: lifestyle.enabled ? 18 : 0 }}>
                <div>
                  <div className="section-label" style={{ margin: 0 }}><span className="num">3</span>Estilo de vida y patrimonio</div>
                  <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 6, maxWidth: 420 }}>
                    {lifestyle.enabled ?
                    'Gastar y tener también te cuesta.' :
                    'Activa para calcular además IVA, IBI y patrimonio. Si está apagado, solo se muestra el neto tras IRPF y SS.'}
                  </div>
                </div>
                <div
                  className={`mini-switch${lifestyle.enabled ? ' on' : ''}`}
                  onClick={() => setL('enabled', !lifestyle.enabled)}
                  role="switch" aria-checked={lifestyle.enabled}>
                  
                  <span className="dot"></span>
                </div>
              </div>

              {lifestyle.enabled &&
              <div style={{ display: 'grid', gap: 14 }}>
                  <SliderField
                  label="Porcentaje del neto que gastas al año"
                  value={Math.round(activeSpendRate * 100)}
                  onChange={(v) => setL('spendRate', v / 100)}
                  min={20} max={100} step={1}
                  format={(v) => `${v} %`}
                  suggested={Math.round(suggestedSR * 100)} />
                

                  <ToggleRow
                  on={lifestyle.ownsHome}
                  onChange={(v) => setL('ownsHome', v)}
                  text="Tengo vivienda en propiedad"
                  sub="(Cuenta también para el patrimonio neto)" />
                

                  {lifestyle.ownsHome &&
                <div className="grid-2">
                      <NumberField
                    label="Valor de mercado vivienda"
                    value={lifestyle.homeValue}
                    onChange={(v) => setL('homeValue', v)}
                    suffix="€" step={5000} />
                  
                      <NumberField
                    label="Hipoteca pendiente"
                    value={lifestyle.mortgage}
                    onChange={(v) => setL('mortgage', v)}
                    suffix="€" step={5000} />
                  
                    </div>
                }

                  <NumberField
                  label="Patrimonio financiero (ahorros, inversiones)"
                  value={lifestyle.financialAssets}
                  onChange={(v) => setL('financialAssets', v)}
                  suffix="€" step={5000}
                  hint="Mínimo exento: 700.000 €. En Madrid y Andalucía hay bonificación del 100%." />
                
                </div>
              }
            </div>

            <div className="disclaimer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 5v3.5M8 11h.01" strokeLinecap="round" />
              </svg>
              <span>Cálculo orientativo basado en los tramos del IRPF 2026 y las normas autonómicas. No sustituye al asesoramiento de un profesional ni a la declaración oficial de la AEAT.</span>
            </div>
          </div>

          {/* RIGHT — RESULT */}
          <div>
            <div className="result-card">
              <div className="stamp">
                <span>{lifestyle.enabled ? 'efectivo anual' : 'neto anual'} · {2026}</span>
                <span>{REGION_LIST.find((r) => r.id === input.region)?.label}</span>
              </div>
              <div className="big">
                <span className="numerals"><AnimatedNumber value={lifestyle.enabled ? effective.effective : result.net} formatter={fmtEur} /></span>
                <span className="cur">/ año</span>
              </div>
              <div className="sub">
                <span><strong className="numerals">{fmtEur(lifestyle.enabled ? effective.effectiveMonthly : result.monthly)}</strong> al mes</span>
                {!isAuto &&
                <span><strong className="numerals">{fmtEur(result.perPayment)}</strong> por paga {input.payments === 14 && '(×14)'}</span>
                }
                <span>Tipo efectivo: <strong className="numerals">{fmtPct(input.gross > 0 ? (result.irpf + result.ss) / input.gross : 0)}</strong></span>
                {lifestyle.enabled &&
                <span>Con estilo de vida: <strong className="numerals">{fmtPct(effective.totalRate)}</strong></span>
                }
              </div>
              {lifestyle.enabled &&
              <div className="secondary">
                  <div className="row">
                    <span>Neto</span>
                    <span className="v"><AnimatedNumber value={result.net} formatter={fmtEur} /> <span style={{ color: 'oklch(0.7 0.04 88)' }}>/ {fmtEur(result.monthly)} mes</span></span>
                  </div>
                  <div className="row">
                    <span>− IVA</span>
                    <span className="v">−<AnimatedNumber value={effective.vat} formatter={fmtEur} /></span>
                  </div>
                  <div className="row">
                    <span>− IBI + Patrimonio</span>
                    <span className="v">−<AnimatedNumber value={effective.property} formatter={fmtEur} /></span>
                  </div>
                </div>
              }
            </div>

            <div className="card">
              <div className="section-label">
                <span className="num">4</span>Desglose{lifestyle.enabled ? ' completo' : ''}
              </div>

              <div className="bar" aria-hidden>
                {lifestyle.enabled ?
                <>
                    <div className="seg-bar effective" style={{ width: `${pctEffective}%` }}>{pctEffective >= 10 ? `${pctEffective.toFixed(0)}%` : ''}</div>
                    <div className="seg-bar vat" style={{ width: `${pctVat}%` }}>{pctVat >= 6 ? `${pctVat.toFixed(0)}%` : ''}</div>
                    <div className="seg-bar property" style={{ width: `${pctProp}%` }}>{pctProp >= 4 ? `${pctProp.toFixed(0)}%` : ''}</div>
                    <div className="seg-bar irpf" style={{ width: `${pctIrpf}%` }}>{pctIrpf >= 6 ? `${pctIrpf.toFixed(0)}%` : ''}</div>
                    <div className="seg-bar ss" style={{ width: `${pctSs}%` }}>{pctSs >= 5 ? `${pctSs.toFixed(0)}%` : ''}</div>
                  </> :

                <>
                    <div className="seg-bar net" style={{ width: `${100 - pctIrpf - pctSs}%` }}>{100 - pctIrpf - pctSs >= 10 ? `${(100 - pctIrpf - pctSs).toFixed(0)}%` : ''}</div>
                    <div className="seg-bar irpf" style={{ width: `${pctIrpf}%` }}>{pctIrpf >= 6 ? `${pctIrpf.toFixed(0)}%` : ''}</div>
                    <div className="seg-bar ss" style={{ width: `${pctSs}%` }}>{pctSs >= 5 ? `${pctSs.toFixed(0)}%` : ''}</div>
                  </>
                }
              </div>

              <div className="legend">
                {lifestyle.enabled ?
                <>
                    <div className="item"><span className="sw" style={{ background: 'var(--hi)' }}></span>Efectivo</div>
                    <div className="item"><span className="sw" style={{ background: 'oklch(0.78 0.10 75)' }}></span>IVA</div>
                    <div className="item"><span className="sw" style={{ background: 'oklch(0.55 0.08 50)' }}></span>IBI + Patrimonio</div>
                    <div className="item"><span className="sw" style={{ background: 'var(--ink)' }}></span>IRPF</div>
                    <div className="item"><span className="sw" style={{ background: 'var(--mute)' }}></span>{ssLabel}</div>
                  </> :

                <>
                    <div className="item"><span className="sw" style={{ background: 'var(--hi)' }}></span>Neto</div>
                    <div className="item"><span className="sw" style={{ background: 'var(--ink)' }}></span>IRPF</div>
                    <div className="item"><span className="sw" style={{ background: 'var(--mute)' }}></span>{ssLabel}</div>
                  </>
                }
              </div>

              <div className="detail-table">
                <div className="row">
                  <span className="label">Bruto Anual</span>
                  <span><AnimatedNumber value={input.gross} formatter={fmtEur} /></span>
                </div>
                <div className="row">
                  <span className="label">– {ssLabel}</span>
                  <span>−<AnimatedNumber value={result.ss} formatter={fmtEur} /></span>
                </div>
                <div className="row">
                  <span className="label">– IRPF</span>
                  <span>−<AnimatedNumber value={result.irpf} formatter={fmtEur} /></span>
                </div>
                <div className={`row${lifestyle.enabled ? ' subtotal' : ' total'}`}>
                  <span className="label">= Neto Anual</span>
                  <span><AnimatedNumber value={result.net} formatter={fmtEur} /></span>
                </div>
                {lifestyle.enabled &&
                <>
                    <div className="row">
                      <span className="label">– IVA (sobre <AnimatedNumber value={effective.spending} formatter={fmtEur} /> gastados)</span>
                      <span>−<AnimatedNumber value={effective.vat} formatter={fmtEur} /></span>
                    </div>
                    <div className="row">
                      <span className="label">– IBI</span>
                      <span>−<AnimatedNumber value={effective.ibi} formatter={fmtEur} /></span>
                    </div>
                    <div className="row">
                      <span className="label">– Impuesto sobre el Patrimonio{effective.wealthBonif > 0 && effective.taxableWealth > 0 ? ` (${Math.round(effective.wealthBonif * 100)}% bonificado)` : ''}</span>
                      <span>−<AnimatedNumber value={effective.patrimonio} formatter={fmtEur} /></span>
                    </div>
                    <div className="row total">
                      <span className="label">= Efectivo anual</span>
                      <span><AnimatedNumber value={effective.effective} formatter={fmtEur} /></span>
                    </div>
                  </>
                }
              </div>

              <div className="actions">
                <div className="tags">
                  {!isAuto && <span className="tag">Retención ≈ {fmtPct(result.withholding)}</span>}
                  {lifestyle.enabled && <span className="tag">IVA medio ≈ 8,5%</span>}
                  {lifestyle.enabled && lifestyle.ownsHome && <span className="tag">IBI ≈ 0,18% s/mercado</span>}
                </div>
                <div className="spacer"></div>
                <button className="btn ghost" title="Compartir" onClick={share}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 5l-6 2M12 11l-6-2M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" strokeLinejoin="round" />
                  </svg>
                  Compartir
                </button>
                <button className="btn" onClick={() => window.print()}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 6V2h8v4M4 12H2V6h12v6h-2M5 10h6v4H5z" strokeLinejoin="round" />
                  </svg>
                  PDF
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* UN ESTADO MÍNIMO — RALLO COMPARISON */}
        <RalloComparison
          gross={input.gross}
          personal={lifestyle.enabled ? effective.effective : result.net}
          lifestyleEnabled={lifestyle.enabled}
          isAuto={isAuto} />


        {/* EXPLAINER */}
        <section id="como" className="card" style={{ marginBottom: 64 }}>
          <div className="section-label"><span className="num">i</span>Cómo se calcula</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            <Step n="1" title="Seguridad Social" body={isAuto ? 'Para autónomos: cuota mensual según tramos de ingresos netos reales (sistema 2023+).' : '6,35% sobre el bruto (contingencias + desempleo + FP), con tope máximo de cotización de ~58.914 €/año.'} />
            <Step n="2" title="IRPF" body="Tramos estatales + autonómicos de tu comunidad, restando los mínimos personal y familiar y la reducción por trabajo." />
            {lifestyle.enabled && <Step n="3" title="IVA al consumir" body={`Estimamos que gastas ~${Math.round(activeSpendRate * 100)}% de tu neto. Aplicamos un IVA efectivo medio del 8,5% (mezcla ponderada de 21% / 10% / 4% según cesta de consumo española).`} />}
            {lifestyle.enabled && <Step n="4" title="IBI y Patrimonio" body="IBI: ~0,5% sobre valor catastral ≈ 0,18% sobre valor de mercado. Patrimonio: mínimo exento 700k€ + 300k€ vivienda habitual. Madrid y Andalucía bonifican el 100%." />}
          </div>
        </section>
      </main>

      <footer className="site-footer shell">
        <span>© 2026 tus impuestos — cálculos orientativos</span>
        <div className="links">
          <a href="#">Privacidad</a>
          <a href="#">Metodología</a>
          <a href="#">Contacto</a>
        </div>
      </footer>
    </>);

}

// ─── Un Estado Mínimo — Rallo comparison ─────────────────
const RALLO_FLAT = 0.05; // 5% flat tax on gross
const RALLO_FEES = 0.0055; // 0.55% fees on gross
const RALLO_TOTAL = RALLO_FLAT + RALLO_FEES;

function RalloComparison({ gross, personal, lifestyleEnabled, isAuto }) {
  const currentState = Math.max(0, gross - personal);
  const ralloFlat = gross * RALLO_FLAT;
  const ralloFees = gross * RALLO_FEES;
  const ralloState = ralloFlat + ralloFees;
  const ralloPersonal = gross - ralloState;
  const wealthGained = Math.max(0, ralloPersonal - personal);
  const pctGain = personal > 0 ? wealthGained / personal * 100 : 0;

  const g = gross > 0 ? gross : 1;
  const pctCP = Math.max(0, personal / g * 100);
  const pctCS = Math.max(0, currentState / g * 100);
  const pctRP = Math.max(0, ralloPersonal / g * 100);
  const pctRS = Math.max(0, ralloState / g * 100);

  const currentTaxesLabel = lifestyleEnabled ?
  `IRPF + ${isAuto ? 'Cuota Aut.' : 'SS'} + IVA + IBI + Patrimonio` :
  `IRPF + ${isAuto ? 'Cuota Autónomos' : 'Seguridad Social'}`;
  const currentRate = gross > 0 ? (currentState / gross * 100).toFixed(1) : '0';

  return (
    <section className="rallo-card" id="estado-minimo">
      <div className="rallo-head">
        <div className="eyebrow">una alternativa · juan ramón rallo</div>
        <h2>¿Y si pagáramos un <span className="mark-g">Estado Mínimo</span>?</h2>
        <p>
          En lugar del laberinto fiscal actual, el economista Juan Ramón Rallo propone un único impuesto general del <strong>5% sobre la renta</strong>, además de las tasas aplicables al estilo de vida, que conformarían un <b>0.5% del PIB.</b> En este escenario, el tamaño del estado sería un <b>90% menor</b>, o dicho de otro modo, el ciudadano sería un <b>90% más libre</b>.
        </p>
      </div>

      <div className="rallo-grid">
        <div className="rallo-panel current">
          <div className="panel-tag">
            <span>Sistema actual</span>
            <span className="rate numerals">{currentRate}%</span>
          </div>
          <div className="panel-bar">
            <div className="seg-bar personal" style={{ width: `${pctCP}%` }}>
              {pctCP >= 14 ? `${pctCP.toFixed(0)}%` : ''}
            </div>
            <div className="seg-bar state" style={{ width: `${pctCS}%` }}>
              {pctCS >= 14 ? `${pctCS.toFixed(0)}%` : ''}
            </div>
          </div>
          <div className="panel-rows">
            <div className="row">
              <span className="dot personal"></span>
              <span className="lbl">
                Personal
                <span className="hint">Lo que de verdad te llega</span>
              </span>
              <span className="v"><AnimatedNumber value={personal} formatter={fmtEur} /></span>
            </div>
            <div className="row">
              <span className="dot state"></span>
              <span className="lbl">
                Estado
                <span className="hint">{currentTaxesLabel}</span>
              </span>
              <span className="v"><AnimatedNumber value={currentState} formatter={fmtEur} /></span>
            </div>
          </div>
        </div>

        <div className="rallo-panel rallo">
          <div className="panel-tag">
            <span>Estado Mínimo · Rallo</span>
            <span className="rate numerals">5,55%</span>
          </div>
          <div className="panel-bar">
            <div className="seg-bar personal" style={{ width: `${pctRP}%` }}>
              {pctRP >= 14 ? `${pctRP.toFixed(0)}%` : ''}
            </div>
            <div className="seg-bar state" style={{ width: `${pctRS}%` }}>
              {pctRS >= 6 ? `${pctRS.toFixed(1)}%` : ''}
            </div>
          </div>
          <div className="panel-rows">
            <div className="row">
              <span className="dot personal"></span>
              <span className="lbl">
                Personal
                <span className="hint">Lo que te llegaría</span>
              </span>
              <span className="v"><AnimatedNumber value={ralloPersonal} formatter={fmtEur} /></span>
            </div>
            <div className="row">
              <span className="dot state"></span>
              <span className="lbl">
                Estado
                <span className="hint">5% impuesto fijo + tasas (aproximadas)</span>
              </span>
              <span className="v"><AnimatedNumber value={ralloState} formatter={fmtEur} /></span>
            </div>
          </div>
        </div>
      </div>

      <div className="rallo-gain">
        <div className="lbl">
          <span className="eyebrow">Riqueza ganada</span>
          <span className="desc">Lo que tendrías de más en tu bolsillo cada año</span>
        </div>
        <div className="amt">
          <span className="plus">+</span>
          <span className="numerals"><AnimatedNumber value={wealthGained} formatter={fmtEur} /></span>
          <span className="pct">+{pctGain.toFixed(0)}%</span>
        </div>
      </div>
    </section>);

}

function Step({ n, title, body }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-num)', fontSize: 12, color: 'var(--mute)', marginBottom: 6 }}>{`0${n}`}</div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{body}</div>
    </div>);

}

function share() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: 'tus impuestos', url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);