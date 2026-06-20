// ───────────────────────────────────────────────────────────
// BLOQUE 2 · "Los cimientos" — los 10 principios como LISTA (1→10).
// Clic en cualquier principio = despliega su resumen.
// Se carga ANTES de app.jsx y exporta a window.
// ───────────────────────────────────────────────────────────
const { useState: useStateP } = React;

// Contenido fiel a "Liberalismo: los diez principios básicos del orden
// político liberal" (J. R. Rallo). Resúmenes propios, no citas literales.
// Orden 1→10: de los dos presupuestos (base) al frontispicio (cúspide).
const PRINCIPLES = [
  { cat: 'Presupuesto', t: 'Individualismo político',
    body: 'El punto de partida del liberalismo es el individuo: el sujeto moral no es la colectividad, ni la nación, ni la tradición, ni ninguna divinidad, sino cada persona, entendida como un agente autónomo que elabora y persigue sus propios proyectos de vida. Negarlo equivale a convertir a unos en objetos al servicio de otros; su forma extrema es la esclavitud.' },
  { cat: 'Presupuesto', t: 'Igualdad jurídica',
    body: 'Si cada persona es sujeto de derecho, lo es en pie de igualdad con las demás: nadie goza de privilegios políticos ni de un estatus que lo exima de las reglas comunes. Las mismas normas valen para todos. Donde se niega esa igualdad, unos quedan a merced de otros, que pueden atropellarlos con impunidad.' },
  { cat: 'Derecho', t: 'Libertad',
    body: 'El derecho más básico, del que derivan los demás, es la libertad en sentido negativo: que nadie interfiera por la fuerza en la ejecución de los propios planes, garantizando a cada uno una esfera privada de acción. Su correlato es el deber de respetar la libertad ajena —vive y deja vivir— y la responsabilidad por los propios actos. De ahí la ley de la igual libertad: la mayor libertad de cada cual que sea compatible con la igual libertad de los demás.' },
  { cat: 'Derecho', t: 'Propiedad',
    body: 'La libertad aplicada a las cosas es la propiedad: el derecho a usar, disfrutar y disponer de los bienes adquiridos pacíficamente, incluida la potestad de excluir a los demás. Se extiende también a los medios de producción, no solo a los bienes de consumo. Tal es su peso que algunos liberales resumen el programa en una sola palabra: propiedad.' },
  { cat: 'Derecho', t: 'Autonomía contractual',
    body: 'Cada persona puede comprometerse voluntariamente con otras y quedar vinculada por la palabra dada: transferir bienes, prestar servicios o asumir obligaciones en los términos que libremente pacte. Es el cauce por el que, partiendo de la libertad, cada uno construye los derechos «positivos» que de verdad valora, en lugar de que se los imponga un tercero.' },
  { cat: 'Derecho', t: 'Reparación del daño',
    body: 'La libertad va unida a la responsabilidad: quien lesiona la libertad, la propiedad o los contratos de otro comete un ilícito y debe reparar el daño a la víctima. Este principio cierra el sistema de derechos: ante la violación, lo que se activa es la restitución al perjudicado, no el castigo por el castigo.' },
  { cat: 'Institución', t: 'Libre asociación',
    body: 'De la libertad, la propiedad y los contratos nace la primera gran forma de cooperación: el derecho a asociarse y a desasociarse voluntariamente. Comunidades de vecinos, sindicatos, iglesias, asociaciones o partidos son expresiones de ese derecho. Es también lo que permite, dentro del marco liberal, levantar comunidades de cualquier signo —incluso socialistas— siempre que se entre y se salga libremente.' },
  { cat: 'Institución', t: 'Libre mercado',
    body: 'Aplicada a lo económico, esa cooperación es el libre mercado: libre elección de oficio, propiedad de los medios de producción, libre comercio, libre empresa y libre competencia. No es «explotación», sino colaboración en los términos que cada parte acepta: «de cada cual como escoja, a cada cual como sea escogido». En su forma más desarrollada es el capitalismo, pero también admite comunas y cooperativas.' },
  { cat: 'Institución', t: 'Gobierno limitado',
    body: 'Como los derechos no se respetan solos, las personas se organizan en comunidades políticas; pero ese gobierno debe ceñirse estrictamente a proteger los derechos individuales y someterse a las mismas reglas que todos. Un poder ilimitado se convierte en un privilegiado capaz de violar la libertad, la propiedad o los contratos, rompiendo la igualdad jurídica y el propio individualismo. En una sociedad libre, la ley —y nadie más— es el rey.' },
  { cat: 'Frontispicio', t: 'Globalización',
    body: 'Los derechos no dependen del grupo, la nación ni la frontera: son universales. Por eso el orden liberal es cosmopolita y se proyecta más allá de las fronteras, extendiendo a la esfera internacional la libre asociación civil y comercial. Su lema exterior es el mismo que el interior: no interferir por la fuerza, interactuar pacíficamente. Una aldea y un bazar globales, no un Estado planetario.' },
];

// Fila reutilizable de principio (clic = expande resumen).
function PrincipleCard({ idx, cat, title, body }) {
  const [open, setOpen] = useStateP(false);
  return (
    <button
      className={`principle-card${open ? ' open' : ''}`}
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}>
      <div className="pc-head">
        <span className="pc-idx numerals">{idx}</span>
        <span className="pc-title">{title}</span>
        <span className="pc-cat">{cat}</span>
        <svg className="pc-caret" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2.5 1.5L7.5 5L2.5 8.5" />
        </svg>
      </div>
      {open && <div className="pc-body">{body}</div>}
    </button>);

}

function PrincipiosSection() {
  return (
    <section className="guide-section" id="principios">
      <div className="shell">
        <div className="guide-head">
          <div className="eyebrow">bloque 02 · principios del liberalismo</div>
          <h2>Los <mark>10 principios</mark> del liberalismo</h2>
          <p>Para Rallo, el liberalismo no es una etiqueta vaga sino una filosofía con diez principios encadenados, donde cada uno se deduce del anterior. Se leen de abajo arriba: dos <b>presupuestos</b> sostienen cuatro <b>derechos</b>, que habilitan tres <b>instituciones</b> y culminan en un <b>frontispicio</b>, la globalización. Pulsa cualquier principio para leer su resumen.</p>
        </div>

        <div className="principle-list">
          {PRINCIPLES.map((p, i) =>
          <PrincipleCard
            key={p.t}
            idx={String(i + 1).padStart(2, '0')}
            cat={p.cat}
            title={p.t}
            body={p.body} />
          )}
        </div>
      </div>
    </section>);

}

window.PrincipleCard = PrincipleCard;
window.PrincipiosSection = PrincipiosSection;
