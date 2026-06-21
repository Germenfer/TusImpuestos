// ───────────────────────────────────────────────────────────
// BLOQUE 4 · "Cómo transicionar" — hoja de ruta por fases.
// OJO: distinto de la sección #como ("Cómo se calcula", IRPF),
// que vive en el bloque 1.
// ───────────────────────────────────────────────────────────

const PHASES = [
  {
    when: 'Premisa · condición previa',
    title: 'La sociedad debe quererlo',
    body: 'Rallo no diseña un plan para imponer desde arriba, sino una condición previa: que sea la propia población quien reclame la retirada del Estado. La transición va de abajo arriba. El Estado solo abandona áreas que nunca debió ocupar y reconoce la propiedad privada que ya existía, en lugar de repartir un orden nuevo desde cero. Así se reduce el riesgo de que la operación la capturen lobbies y oligarcas.',
    tags: ['De abajo arriba', 'Demanda ciudadana', 'Reconocer propiedad'],
  },
  {
    when: 'Arranque · primeras reformas',
    title: 'Liberalizar sin frenar la economía',
    body: 'Achicar un Estado que ocupa la mitad de la economía contrae la actividad a corto plazo, como mostraron las transiciones del Este (el PIB húngaro cayó un 18 % entre 1989 y 1993). Por eso conviene superar antes la crisis vigente y empezar por las reformas que más impulsan el crecimiento: apertura comercial, supresión de subvenciones y liberalización del mercado de trabajo.',
    tags: ['Apertura comercial', 'Fin de subvenciones', 'Mercado laboral'],
  },
  {
    when: 'Reasignación de la propiedad',
    title: 'Privatizar de forma transparente',
    body: 'Lo que no pueda devolverse a sus dueños originales se privatiza por tres vías combinadas: subasta pública, entrega a trabajadores y gestores, o reparto de acciones entre todos los ciudadanos. Las grandes empresas y los hospitales encajan en el reparto de acciones; los colegios, en la entrega a su personal; el suelo y las infraestructuras, en la subasta. La clave es máxima transparencia y competencia para evitar la captura oligárquica.',
    tags: ['Subasta', 'Reparto de acciones', 'Anti-captura'],
  },
  {
    when: 'Horizonte ~50 años',
    title: 'Pensiones: de reparto a capitalización',
    body: 'El sistema público se cierra a nuevos cotizantes: cada trabajador conserva el derecho a lo cotizado hasta esa fecha, con un recorte del 2,5 % por cada año no aportado. Se eleva la jubilación a 70 años y se exigen 40 de cotización para el 100 % de la pensión. Un impuesto temporal del 8,5 % al 10,5 % sobre las rentas del trabajo paga a los jubilados actuales y se va extinguiendo. El sistema queda residual en medio siglo.',
    tags: ['Capitalización', 'Jubilación a 70', 'Impuesto de transición'],
  },
  {
    when: 'Horizonte ~50 años',
    title: 'Sanidad: seguros y cuentas de ahorro',
    body: 'Cada ciudadano contrata su seguro médico, idealmente desde joven. Durante la transición el Estado solo cubre a quienes ya no pueden capitalizar a tiempo: mayores y personas con patologías previas. A cambio, estos abren cuentas de ahorro sanitario al estilo del Medisave de Singapur (en torno al 5 % del salario, con un tope de 3.000 €) y el Estado paga lo que exceda ese capital. Coste: entre 20.000 y 30.000 M€ al año, decreciente desde 2045.',
    tags: ['Seguro médico', 'Cuentas de ahorro', 'Medisave'],
  },
  {
    when: 'Saneamiento · hasta 2050',
    title: 'Amortizar la deuda y liberar el dinero',
    body: 'Los intereses de la deuda rondan hoy el 4 % del PIB, casi el doble de todo el gasto del Estado mínimo. Se amortizan combinando crecimiento sin déficit, un impuesto extraordinario del 2 % al 3 % del PIB y la venta ordenada de activos (infraestructuras valoradas en unos 500.000 M€), de modo que la deuda desaparezca hacia 2050. En paralelo se desmonta el monopolio del dinero: fin del curso legal forzoso y privatización del banco central.',
    tags: ['Amortización de deuda', 'Venta de activos', 'Fin del curso legal'],
  },
  {
    when: 'Mediados del siglo XXI',
    title: 'Estado mínimo: 5 % del PIB',
    body: 'Sumadas las cargas de transición, la presión fiscal extraordinaria para desmantelar el Estado de bienestar se mueve entre el 11,5 % y el 13,5 %, y el sector público no superaría el 20 % del PIB durante el proceso, el nivel de un país próspero como Singapur. Al final del recorrido, hacia mediados de siglo, el Estado queda acotado al 5 % del PIB. La transición es gradual pero factible: los únicos obstáculos son ideológicos, no técnicos.',
    tags: ['5 % del PIB', '≤20 % en transición', 'Gradual y factible'],
  },
];

function TransicionSection() {
  return (
    <section className="guide-section" id="transicion">
      <div className="shell">
        <div className="guide-head">
          <div className="eyebrow">bloque 05 · transición liberal</div>
          <h2>Cómo llegar al <mark>Estado mínimo</mark></h2>
          <p>Rallo no propone un golpe de timón, sino un proceso gradual y de abajo arriba: el Estado se retira de lo que nunca debió ocupar, y lo hace cuando la sociedad lo reclama. Conlleva una carga fiscal extraordinaria y temporal para liquidar las obligaciones pendientes, pero el sector público bajaría de inmediato a la mitad y alcanzaría el 5 % del PIB hacia mediados de siglo. Difícil, pero factible: los obstáculos son ideológicos, no técnicos.</p>
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