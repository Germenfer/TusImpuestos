// 5 wireframe variations for tus impuestos
// Each is a self-contained component. They all share the wireframe-kit primitives.

// ─────────────────────────────────────────────────────────────
// V1 — CLASSIC SPLIT
// Form on the left, results panel on the right. The "boring & familiar" baseline.
// ─────────────────────────────────────────────────────────────
function V1ClassicSplit({ showBreakdown }) {
  return (
    <div style={{
      width: 1100, height: 720, background: wkPaper,
      fontFamily: 'JetBrains Mono, monospace', color: wkInk,
      padding: 32, boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    }}>
      <WHeader subtitle="V1 · split clásico" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 32, flex: 1, minHeight: 0 }}>
        {/* LEFT — form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <WLabel>1 · tu situación</WLabel>
          <WToggle options={['Asalariado', 'Autónomo']} active={0} />

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 10 }}>
            <WInput label="Salario bruto" value="35.000 €" hint="anual" accent />
            <WSelect label="Pagas" value="14" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <WSelect label="Comunidad" value="Madrid" />
            <WInput label="Edad" value="32" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <WSelect label="Estado civil" value="Soltero/a" />
            <WInput label="Hijos < 25" value="0" />
          </div>

          <WLabel style={{ marginTop: 8 }}>2 · deducciones (opcional)</WLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <WInput label="Aport. pensión" value="—" hint="€/año" />
            <WInput label="Discapacidad" value="No" />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <WBtn primary>Calcular</WBtn>
            <WBtn>Limpiar</WBtn>
          </div>

          <WNote style={{ marginTop: 4, color: wkMute, alignSelf: 'flex-start' }} rotate={-1}>
            ← rellenar de arriba a abajo
          </WNote>
        </div>

        {/* RIGHT — results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <WBox fill={wkHiSoft} pad={20} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <WLabel>tu neto · 2026</WLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 44, fontWeight: 600, letterSpacing: -1 }}>
                27.318 €
              </span>
              <span style={{ fontSize: 12, color: wkMute }}>/ año</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: wkMute, paddingTop: 6, borderTop: `1px dashed ${wkLine}` }}>
              <span>1.951 € / mes <span style={{ color: wkFaint }}>(×14)</span></span>
              <span>tipo efectivo · 21,9%</span>
            </div>
          </WBox>

          {showBreakdown && (
            <>
              <WLabel>desglose</WLabel>
              <WStackedBar segments={[
                { label: 'Neto', pct: 78, fill: wkPalette.net, amount: '27.318' },
                { label: 'IRPF', pct: 16, fill: wkPalette.irpf, amount: '5.600', dark: true },
                { label: 'SS', pct: 6, fill: wkPalette.ss, amount: '2.082', dark: true },
              ]} />

              <WBox pad={14} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Bruto anual', '35.000 €'],
                  ['– IRPF (Madrid)', '−5.600 €'],
                  ['– Seguridad Social', '−2.082 €'],
                  ['= Neto anual', '27.318 €'],
                ].map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: i === 3 ? 600 : 400, paddingTop: i === 3 ? 6 : 0, borderTop: i === 3 ? `1.5px solid ${wkLine}` : 'none' }}>
                    <span>{k}</span><span>{v}</span>
                  </div>
                ))}
              </WBox>
            </>
          )}

          <div style={{ marginTop: 'auto', fontSize: 11, color: wkMute, display: 'flex', justifyContent: 'space-between' }}>
            <span>↻ recalcula al cambiar</span>
            <span>compartir · descargar PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V2 — CALCULATOR / RECEIPT
// One huge number on top, taxes "subtract" visually down the page like a receipt
// ─────────────────────────────────────────────────────────────
function V2Receipt({ showBreakdown }) {
  return (
    <div style={{
      width: 1100, height: 720, background: wkPaper,
      fontFamily: 'JetBrains Mono, monospace', color: wkInk,
      padding: 32, boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    }}>
      <WHeader subtitle="V2 · calculadora / recibo" />

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 36, flex: 1, minHeight: 0 }}>
        {/* LEFT — receipt */}
        <div style={{
          border: `1.5px solid ${wkLine}`, background: '#fff', padding: 24,
          display: 'flex', flexDirection: 'column', gap: 14,
          backgroundImage: 'repeating-linear-gradient(transparent 0 31px, #f0ede5 31px 32px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <WLabel>cobras al año</WLabel>
            <WLabel>2026 · madrid · 14 pagas</WLabel>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 64, fontWeight: 600, letterSpacing: -2, lineHeight: 1 }}>35.000</span>
            <span style={{ fontSize: 28, color: wkMute }}>€</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: wkMute }}>edita ↑</span>
          </div>

          <div style={{ height: 1, background: wkLine, marginTop: 8 }} />

          {[
            ['IRPF', '−5.600 €', '16,0%'],
            ['Seguridad Social', '−2.082 €', '5,9%'],
          ].map(([k, v, p], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 16 }}>{k}</span>
              <span style={{ flex: 1, borderBottom: `1px dotted ${wkFaint}`, marginBottom: 4 }} />
              <span style={{ fontSize: 11, color: wkMute }}>{p}</span>
              <span style={{ fontSize: 16, fontWeight: 500 }}>{v}</span>
            </div>
          ))}

          <div style={{ height: 1, background: wkLine }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>Te llevas</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 40, fontWeight: 700, background: wkHi, padding: '0 8px', letterSpacing: -1 }}>27.318 €</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: wkMute }}>
            <span>= 1.951 € / mes</span>
            <span>tipo efectivo 21,9%</span>
          </div>

          {/* faux tear-off */}
          <div style={{ position: 'relative', height: 14, marginTop: 6 }}>
            <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(90deg, ${wkLine} 0 6px, transparent 6px 12px)`, height: 1, top: 7 }} />
          </div>
          <WNote style={{ alignSelf: 'flex-end', color: wkMute }} rotate={-3}>↑ se lee como una nómina</WNote>
        </div>

        {/* RIGHT — context inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <WLabel>ajusta tu perfil</WLabel>
          <WToggle options={['Asalariado', 'Autónomo']} active={0} />
          <WSelect label="Comunidad autónoma" value="Madrid" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <WSelect label="Pagas" value="14" />
            <WInput label="Edad" value="32" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <WSelect label="Estado civil" value="Soltero/a" />
            <WInput label="Hijos" value="0" />
          </div>
          <WBox dashed pad={12} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <WLabel>extras opcionales</WLabel>
            <div style={{ fontSize: 12, color: wkMute, lineHeight: 1.5 }}>
              + Aportación a plan de pensiones<br/>
              + Discapacidad<br/>
              + Movilidad geográfica
            </div>
          </WBox>
          {showBreakdown && (
            <WBox fill={wkHiSoft} pad={12}>
              <WLabel>donde van tus €</WLabel>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <WDonut size={130} segments={[
                  { pct: 78, fill: wkPalette.net },
                  { pct: 16, fill: wkPalette.irpf },
                  { pct: 6, fill: wkPalette.ss },
                ]} />
              </div>
            </WBox>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { V1ClassicSplit, V2Receipt });
