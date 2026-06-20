// ───────────────────────────────────────────────────────────
// BLOQUE 4 · "Cómo transicionar" — hoja de ruta por fases.
// OJO: distinto de la sección #como ("Cómo se calcula", IRPF),
// que vive en el bloque 1.
// ───────────────────────────────────────────────────────────

// 👉 SUSTITUYE títulos, plazos y descripciones por tu contenido real.
const PHASES = [
  {
    when: 'Fase 1 · primeros 100 días',
    title: 'Estabilización y transparencia',
    body: 'Texto de marcador de posición: medidas inmediatas para frenar el crecimiento del gasto y hacer visible el coste real del Estado.',
    tags: ['Auditoría del gasto', 'Techo de déficit'],
  },
  {
    when: 'Fase 2 · año 1–2',
    title: 'Simplificación fiscal',
    body: 'Texto de marcador de posición: tránsito gradual hacia el impuesto único del 5% sobre la renta y eliminación de figuras redundantes.',
    tags: ['Impuesto único', 'Eliminación de tasas'],
  },
  {
    when: 'Fase 3 · año 2–4',
    title: 'Reforma de los grandes sistemas',
    body: 'Texto de marcador de posición: capitalización progresiva de pensiones y apertura a la competencia en sanidad y educación.',
    tags: ['Pensiones', 'Sanidad', 'Educación'],
  },
  {
    when: 'Fase 4 · año 4–6',
    title: 'Descentralización y devolución',
    body: 'Texto de marcador de posición: traslado de competencias a municipios y devolución de servicios a la iniciativa privada y civil.',
    tags: ['Municipios', 'Sociedad civil'],
  },
  {
    when: 'Fase 5 · horizonte',
    title: 'Estado mínimo consolidado',
    body: 'Texto de marcador de posición: el modelo en régimen permanente, con un Estado acotado a sus funciones esenciales.',
    tags: ['Gobierno limitado'],
  },
];

function TransicionSection() {
  return (
    <section className="guide-section" id="transicion">
      <div className="shell">
        <div className="guide-head">
          <div className="eyebrow">bloque 05 · transición liberal</div>
          <h2>Cómo llegar al <mark>Estado mínimo</mark></h2>
          {/* 👉 SUSTITUYE este intro por tu texto. */}
          <p>Ninguna transformación así ocurre de golpe. Esta es una hoja de ruta por fases, de las medidas inmediatas al modelo consolidado.</p>
        </div>

        <div className="roadmap">
          {PHASES.map((p, i) =>
          <div className="phase" key={i}>
              <div className="phase-num numerals">{i + 1}</div>
              <div className="phase-body">
                <div className="phase-when">{p.when}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <div className="phase-tags">
                  {p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

window.TransicionSection = TransicionSection;
