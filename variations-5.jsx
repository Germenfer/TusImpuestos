// ─────────────────────────────────────────────────────────────
// V5 — WHAT-IF DASHBOARD
// Sliders dominate. Donut chart updates live. Feels like a tool, not a form.
// ─────────────────────────────────────────────────────────────
function V5Dashboard({ showBreakdown }) {
  return (
    <div style={{
      width: 1100, height: 720, background: wkPaper,
      fontFamily: 'JetBrains Mono, monospace', color: wkInk,
      padding: 32, boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    }}>
      <WHeader subtitle="V5 · panel what-if" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 28, flex: 1, minHeight: 0 }}>
        {/* LEFT — sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <WLabel>arrastra para simular</WLabel>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Salario bruto</span>
              <span style={{ fontSize: 14, fontWeight: 600, background: wkHi, padding: '0 6px' }}>35.000 €</span>
            </div>
            <WSlider value={45} range="12k — 120k" />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Aport. plan pensiones</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>1.500 €</span>
            </div>
            <WSlider value={30} range="0 — 1.500" />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Hijos &lt; 25</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>0</span>
            </div>
            <WSlider value={0} range="0 — 5" />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Edad</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>32</span>
            </div>
            <WSlider value={25} range="18 — 70" />
          </div>

          <WBox dashed pad={10} style={{ marginTop: 8 }}>
            <WLabel>fijos</WLabel>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {['Madrid', '14 pagas', 'Soltero/a', 'Asalariado'].map((t) => (
                <span key={t} style={{ fontSize: 10, padding: '3px 7px', border: `1px solid ${wkLine}`, borderRadius: 99 }}>{t} ✕</span>
              ))}
            </div>
          </WBox>
        </div>

        {/* CENTER — big donut + number */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
          <WLabel>tu neto en directo</WLabel>
          <div style={{ position: 'relative', width: 280, height: 280 }}>
            <WDonut size={280} segments={[
              { pct: 78, fill: wkPalette.net },
              { pct: 16, fill: wkPalette.irpf },
              { pct: 6, fill: wkPalette.ss },
            ]} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>27.318</div>
              <div style={{ fontSize: 11, color: wkMute, marginTop: 2 }}>€ / año</div>
              <div style={{ fontSize: 11, color: wkMute, marginTop: 8, borderTop: `1px solid ${wkFaint}`, paddingTop: 6 }}>1.951 € / mes</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
            {[
              ['Neto', '78%', wkPalette.net],
              ['IRPF', '16%', wkPalette.irpf],
              ['SS', '6%', wkPalette.ss],
            ].map(([k, v, c]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: c, border: `1px solid ${wkLine}` }} />
                <span style={{ fontSize: 11 }}>{k} · {v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — what-if scenarios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <WLabel>escenarios guardados</WLabel>
          {[
            { tag: 'Hoy', net: '27.318 €', sub: 'Madrid · 35k', active: true },
            { tag: 'Subida +10%', net: '29.640 €', sub: '+2.322 €/año', active: false },
            { tag: 'Mudanza Bcn', net: '26.890 €', sub: '−428 €/año', active: false },
            { tag: 'Con hijo', net: '28.014 €', sub: '+696 €/año', active: false },
          ].map((s, i) => (
            <WBox key={i} fill={s.active ? wkHiSoft : '#fff'} pad={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{s.active ? '● ' : '○ '}{s.tag}</div>
                <div style={{ fontSize: 10, color: wkMute, marginTop: 2 }}>{s.sub}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{s.net}</div>
            </WBox>
          ))}
          <WBtn style={{ marginTop: 4, alignSelf: 'flex-start' }}>+ Guardar escenario</WBtn>

          {showBreakdown && (
            <WBox dashed pad={10} style={{ marginTop: 6 }}>
              <WLabel>desglose actual</WLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6, fontSize: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bruto</span><span>35.000 €</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>− IRPF</span><span>−5.600 €</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>− SS</span><span>−2.082 €</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: `1px solid ${wkLine}`, paddingTop: 4 }}><span>Neto</span><span>27.318 €</span></div>
              </div>
            </WBox>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { V5Dashboard });
