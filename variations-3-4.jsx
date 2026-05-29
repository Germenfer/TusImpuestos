// ─────────────────────────────────────────────────────────────
// V3 — MULTI-STEP WIZARD
// One question (or small group) at a time. Running total preview sticks to the right.
// ─────────────────────────────────────────────────────────────
function V3Wizard({ showBreakdown }) {
  const steps = ['Situación', 'Ingresos', 'Personal', 'Deducciones', 'Resultado'];
  const active = 2;
  return (
    <div style={{
      width: 1100, height: 720, background: wkPaper,
      fontFamily: 'JetBrains Mono, monospace', color: wkInk,
      padding: 32, boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    }}>
      <WHeader subtitle="V3 · asistente paso a paso" />

      {/* stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                border: `1.5px solid ${wkLine}`,
                background: i < active ? wkInk : i === active ? wkHi : '#fff',
                color: i < active ? '#fff' : wkInk,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600,
              }}>{i < active ? '✓' : i + 1}</div>
              <span style={{
                fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase',
                color: i === active ? wkInk : wkMute,
                fontWeight: i === active ? 600 : 400,
              }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1.5, background: i < active ? wkInk : wkFaint, margin: '0 12px' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, flex: 1, minHeight: 0 }}>
        {/* LEFT — current step */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <WLabel>paso 3 de 5</WLabel>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, margin: '6px 0 4px' }}>
            Cuéntanos sobre ti
          </div>
          <div style={{ fontSize: 13, color: wkMute, marginBottom: 24 }}>
            Estos datos cambian tus deducciones autonómicas y mínimos personales.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 480 }}>
            <WInput label="Edad" value="32" />
            <WSelect label="Estado civil" value="Soltero/a" />
            <WSelect label="Comunidad" value="Madrid" />
            <WInput label="Hijos < 25" value="0" />
            <WSelect label="Ascendientes a cargo" value="No" />
            <WSelect label="Discapacidad" value="No" />
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, borderTop: `1px dashed ${wkFaint}` }}>
            <WBtn>← Atrás</WBtn>
            <span style={{ fontSize: 11, color: wkMute }}>↵ enter para continuar</span>
            <WBtn primary>Siguiente →</WBtn>
          </div>
        </div>

        {/* RIGHT — running summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <WBox fill={wkHiSoft} pad={16}>
            <WLabel>cálculo provisional</WLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>27.318 €</span>
              <span style={{ fontSize: 12, color: wkMute }}>/ año</span>
            </div>
            <div style={{ fontSize: 11, color: wkMute, marginTop: 2 }}>se actualiza al avanzar →</div>
          </WBox>

          {showBreakdown && (
            <WStackedBar segments={[
              { label: 'Neto', pct: 78, fill: wkPalette.net },
              { label: 'IRPF', pct: 16, fill: wkPalette.irpf, dark: true },
              { label: 'SS', pct: 6, fill: wkPalette.ss, dark: true },
            ]} />
          )}

          <WBox pad={14} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <WLabel>lo que sabemos hasta ahora</WLabel>
            {[
              ['Situación', 'Asalariado', true],
              ['Bruto', '35.000 € · 14 pagas', true],
              ['Personal', '…', false],
              ['Deducciones', '—', false],
            ].map(([k, v, done], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: done ? wkInk : wkFaint }}>
                <span>{done ? '✓' : '○'} {k}</span>
                <span>{v}</span>
              </div>
            ))}
          </WBox>

          <WNote style={{ alignSelf: 'flex-start', color: wkMute, marginTop: 4 }} rotate={2}>
            ↗ saltar pasos si ya tienes los datos
          </WNote>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V4 — COMPARE TWO SALARIES (A vs B)
// Two stacked input bars feeding a single comparison view.
// ─────────────────────────────────────────────────────────────
function V4Compare({ showBreakdown }) {
  const Column = ({ tag, salary, region, net, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: color, border: `1.5px solid ${wkLine}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>{tag}</div>
        <span style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: wkMute }}>oferta {tag.toLowerCase()}</span>
      </div>
      <WInput label="Bruto anual" value={salary} accent />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <WSelect label="Comunidad" value={region} />
        <WSelect label="Pagas" value="14" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <WInput label="Edad" value="32" />
        <WSelect label="Estado" value="Soltero/a" />
      </div>
      <WBox fill={color} pad={14} style={{ marginTop: 4 }}>
        <WLabel>neto anual</WLabel>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, marginTop: 2 }}>{net}</div>
      </WBox>
    </div>
  );

  return (
    <div style={{
      width: 1100, height: 720, background: wkPaper,
      fontFamily: 'JetBrains Mono, monospace', color: wkInk,
      padding: 32, boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    }}>
      <WHeader subtitle="V4 · comparador A vs B" />

      <div style={{ display: 'flex', gap: 20, alignItems: 'stretch', flex: 1, minHeight: 0 }}>
        <Column tag="A" salary="35.000 €" region="Madrid" net="27.318 €" color={wkHiSoft} />

        {/* divider with delta */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 140, gap: 6 }}>
          <div style={{ width: 1, flex: 1, background: wkFaint }} />
          <WBox dashed pad={12} style={{ textAlign: 'center', width: '100%' }}>
            <WLabel>diferencia</WLabel>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>+2.450 €</div>
            <div style={{ fontSize: 10, color: wkMute }}>al año · B gana</div>
            <div style={{ fontSize: 11, color: wkMute, marginTop: 6 }}>+204 €/mes</div>
          </WBox>
          <div style={{ width: 1, flex: 1, background: wkFaint }} />
        </div>

        <Column tag="B" salary="42.000 €" region="Barcelona" net="29.768 €" color="oklch(0.94 0.05 240)" />
      </div>

      {showBreakdown && (
        <div style={{ marginTop: 20 }}>
          <WLabel style={{ marginBottom: 8 }}>desglose lado a lado</WLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <WStackedBar segments={[
              { label: 'Neto', pct: 78, fill: wkPalette.net, amount: '27.318' },
              { label: 'IRPF', pct: 16, fill: wkPalette.irpf, dark: true },
              { label: 'SS', pct: 6, fill: wkPalette.ss, dark: true },
            ]} />
            <WStackedBar segments={[
              { label: 'Neto', pct: 71, fill: wkPalette.net, amount: '29.768' },
              { label: 'IRPF', pct: 23, fill: wkPalette.irpf, dark: true },
              { label: 'SS', pct: 6, fill: wkPalette.ss, dark: true },
            ]} />
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { V3Wizard, V4Compare });
