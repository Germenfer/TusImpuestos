// Shared wireframe primitives — boxes, labels, sketchy accents
// Loaded before the variations so they all use the same vocabulary.

const wkInk = '#1a1a1a';
const wkLine = '#2a2a2a';
const wkMute = '#8a8a8a';
const wkFaint = '#cfcfcf';
const wkPaper = '#fafaf7';
const wkHi = 'oklch(0.88 0.13 90)'; // mustard highlight
const wkHiSoft = 'oklch(0.94 0.08 90)';
const wkBlue = 'oklch(0.78 0.08 240)';

// Reusable rectangle/card
function WBox({ children, style = {}, dashed = false, fill = '#fff', pad = 12 }) {
  return (
    <div style={{
      border: `1.5px ${dashed ? 'dashed' : 'solid'} ${wkLine}`,
      background: fill,
      padding: pad,
      borderRadius: 4,
      ...style,
    }}>{children}</div>
  );
}

// Input-field placeholder
function WInput({ label, value, hint, w = '100%', accent = false }) {
  return (
    <div style={{ width: w }}>
      {label && <div style={{ fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: wkMute, marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>{label}</div>}
      <div style={{
        border: `1.5px solid ${wkLine}`,
        background: accent ? wkHiSoft : '#fff',
        padding: '8px 10px',
        borderRadius: 3,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 13,
        minHeight: 18,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: value ? wkInk : wkFaint }}>{value || '—'}</span>
        {hint && <span style={{ color: wkMute, fontSize: 11 }}>{hint}</span>}
      </div>
    </div>
  );
}

// Pseudo-select with chevron
function WSelect({ label, value, w = '100%' }) {
  return (
    <div style={{ width: w }}>
      {label && <div style={{ fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: wkMute, marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>{label}</div>}
      <div style={{
        border: `1.5px solid ${wkLine}`,
        background: '#fff',
        padding: '8px 10px',
        borderRadius: 3,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 13,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>{value}</span>
        <span style={{ color: wkMute }}>▾</span>
      </div>
    </div>
  );
}

// Big button
function WBtn({ children, primary = false, w, style = {} }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 18px',
      border: `1.5px solid ${wkLine}`,
      background: primary ? wkInk : '#fff',
      color: primary ? '#fff' : wkInk,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      borderRadius: 3,
      width: w,
      ...style,
    }}>{children}</div>
  );
}

// Handwritten annotation with arrow
function WNote({ children, style = {}, rotate = -2 }) {
  return (
    <div style={{
      fontFamily: 'Caveat, cursive',
      fontSize: 18,
      color: wkInk,
      transform: `rotate(${rotate}deg)`,
      lineHeight: 1.1,
      ...style,
    }}>{children}</div>
  );
}

// Section label (small caps)
function WLabel({ children, style = {} }) {
  return (
    <div style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: wkMute,
      ...style,
    }}>{children}</div>
  );
}

// Slider widget
function WSlider({ value = 50, label, range }) {
  return (
    <div style={{ width: '100%' }}>
      {label && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: wkInk }}>{label}</span>
        {range && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: wkMute }}>{range}</span>}
      </div>}
      <div style={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: wkFaint }} />
        <div style={{ position: 'absolute', left: 0, width: `${value}%`, height: 2, background: wkInk }} />
        <div style={{
          position: 'absolute',
          left: `calc(${value}% - 8px)`,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          border: `1.5px solid ${wkInk}`,
        }} />
      </div>
    </div>
  );
}

// Header bar shared by all variations
function WHeader({ subtitle }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      borderBottom: `1.5px solid ${wkLine}`,
      paddingBottom: 10,
      marginBottom: 18,
    }}>
      <div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600, letterSpacing: -0.5 }}>
          tus impuestos<span style={{ color: wkHi, marginLeft: 2 }}>.</span>
        </div>
        {subtitle && <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: wkMute, marginTop: 2, letterSpacing: 0.5, textTransform: 'uppercase' }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', gap: 14, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: wkMute, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        <span>Asalariado</span>
        <span style={{ color: wkFaint }}>·</span>
        <span>Autónomo</span>
        <span style={{ color: wkFaint }}>·</span>
        <span>2026 ▾</span>
      </div>
    </div>
  );
}

// Horizontal stacked bar chart segments
function WStackedBar({ segments, height = 28 }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', height, border: `1.5px solid ${wkLine}`, borderRadius: 3, overflow: 'hidden' }}>
        {segments.map((s, i) => (
          <div key={i} style={{
            width: `${s.pct}%`,
            background: s.fill,
            borderRight: i < segments.length - 1 ? `1.5px solid ${wkLine}` : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: s.dark ? '#fff' : wkInk,
          }}>{s.pct >= 8 ? `${s.pct}%` : ''}</div>
        ))}
      </div>
      <div style={{ display: 'flex', marginTop: 8, gap: 14, flexWrap: 'wrap' }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: wkInk }}>
            <span style={{ width: 10, height: 10, background: s.fill, border: `1px solid ${wkLine}`, display: 'inline-block' }} />
            <span>{s.label}</span>
            {s.amount && <span style={{ color: wkMute }}>· {s.amount}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Donut placeholder (SVG circle segments)
function WDonut({ size = 160, segments }) {
  let acc = 0;
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={wkFaint} strokeWidth="22" />
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * c;
        const off = -((acc / 100) * c);
        acc += s.pct;
        return (
          <circle key={i}
            cx={size/2} cy={size/2} r={r}
            fill="none" stroke={s.fill} strokeWidth="22"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={off}
            transform={`rotate(-90 ${size/2} ${size/2})`}
          />
        );
      })}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={wkLine} strokeWidth="1.5" />
      <circle cx={size/2} cy={size/2} r={r - 11} fill="none" stroke={wkLine} strokeWidth="1" />
      <circle cx={size/2} cy={size/2} r={r + 11} fill="none" stroke={wkLine} strokeWidth="1" />
    </svg>
  );
}

// Toggle pill (segmented)
function WToggle({ options, active = 0 }) {
  return (
    <div style={{ display: 'inline-flex', border: `1.5px solid ${wkLine}`, borderRadius: 3, overflow: 'hidden' }}>
      {options.map((opt, i) => (
        <div key={i} style={{
          padding: '6px 12px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          background: i === active ? wkInk : '#fff',
          color: i === active ? '#fff' : wkInk,
          borderRight: i < options.length - 1 ? `1.5px solid ${wkLine}` : 'none',
        }}>{opt}</div>
      ))}
    </div>
  );
}

// Color palette (shared by all wireframes' charts)
const wkPalette = {
  net: wkHi,             // mustard — take-home
  irpf: '#1a1a1a',       // black — income tax
  ss: '#777',            // mid-gray — social security
  other: '#ccc',          // light gray — other
};

Object.assign(window, {
  wkInk, wkLine, wkMute, wkFaint, wkPaper, wkHi, wkHiSoft, wkBlue, wkPalette,
  WBox, WInput, WSelect, WBtn, WNote, WLabel, WSlider, WHeader, WStackedBar, WDonut, WToggle,
});
