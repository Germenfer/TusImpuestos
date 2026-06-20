"""
Comparativa carga fiscal: sistema actual (Madrid, asalariado, soltero, sin hijos)
vs propuesta Rallo (tipo único 20 %, mínimo exento 12 000 €, sin SS separadas).
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick

# ──────────────────────────────────────────────────────────────
# Datos de distribución salarial (AEAT 2024, % de trabajadores)
# ──────────────────────────────────────────────────────────────
DIST_RAW = {
    1000: 0.230068348, 2000: 0.25464169,  3000: 0.741647302,
    4000: 0.837098237, 5000: 0.774125656, 6000: 0.74859922,
    7000: 1.079606961, 8000: 1.334726027, 9000: 1.326531381,
    10000: 1.313766027,11000: 1.336883851,12000: 1.633352134,
    13000: 1.687566596,14000: 2.517942047,15000: 3.533075327,
    16000: 3.841395947,17000: 3.830190726,18000: 3.819020101,
    19000: 3.644858919,20000: 3.77068125, 21000: 3.572762769,
    22000: 3.542570384,23000: 3.147188027,24000: 2.992582004,
    25000: 2.763379702,26000: 2.528684669,27000: 2.336698666,
    28000: 2.24594688,  29000: 2.007250614,30000: 2.2835578,
    31000: 1.777491282,32000: 1.678497833,33000: 1.57954985,
    34000: 1.522855085,35000: 1.437129841,36000: 1.364209195,
    37000: 1.384103335,38000: 1.324861417,39000: 1.274428194,
    40000: 1.275222062,41000: 1.113991102,42000: 1.088823559,
    43000: 0.953975465,44000: 0.949682227,45000: 0.878284008,
    46000: 0.819453339,47000: 0.844256318,48000: 0.724502037,
    49000: 0.723856798,50000: 0.693369237,51000: 0.603348535,
    52000: 0.578318741,53000: 0.491762049,54000: 0.490178546,
    55000: 0.429869255,56000: 0.579195511,57000: 0.37984843,
    58000: 0.328949586,59000: 0.335135684,60000: 0.331689555,
    61000: 0.281086732,62000: 0.288476222,63000: 0.279700138,
    64000: 0.250806507,65000: 0.224393167,66000: 0.248467623,
    67000: 0.21941152,  68000: 0.205654419,69000: 0.189769831,
    70000: 0.168921329,71000: 0.179171301,72000: 0.193825461,
    73000: 0.17678611,  74000: 0.172625036,75000: 0.15798408,
    76000: 0.159739758,77000: 0.125696255,78000: 0.117904057,
    79000: 0.114788804,80000: 0.128151778,81000: 0.10437945,
    82000: 0.136562208,83000: 0.1115821,  84000: 0.110530696,
    85000: 0.096847753,86000: 0.084702007,87000: 0.093349937,
    88000: 0.0957673,   89000: 0.092608524,90000: 0.085109151,
    91000: 0.079394801,92000: 0.078788355,93000: 0.077367962,
    94000: 0.077029169,95000: 0.06618055, 96000: 0.056488381,
    97000: 0.070568003,98000: 0.055952471,99000: 0.07558385,
}

# ──────────────────────────────────────────────────────────────
# Funciones fiscales – Sistema actual
# ──────────────────────────────────────────────────────────────

def apply_brackets(base, brackets):
    if base <= 0:
        return 0.0
    remaining, prev, total = base, 0.0, 0.0
    for up, rate in brackets:
        slice_ = min(remaining, up - prev)
        if slice_ <= 0:
            break
        total += slice_ * rate
        remaining -= slice_
        prev = up
        if remaining <= 0:
            break
    return total

STATE_BRACKETS = [
    (12450,  0.095), (20200, 0.12), (35200, 0.15),
    (60000,  0.185), (300000, 0.225), (float('inf'), 0.245),
]

# Tramo autonómico Madrid
MADRID_BRACKETS = [
    (13362,  0.085), (19004, 0.107), (35425, 0.128),
    (57320,  0.174), (float('inf'), 0.205),
]

# Tramo autonómico genérico (escala complementaria)
DEFAULT_BRACKETS = [
    (12450,  0.095), (20200, 0.12), (35200, 0.15),
    (60000,  0.185), (300000, 0.225), (float('inf'), 0.245),
]


def calc_current(gross, regional=MADRID_BRACKETS):
    """Carga fiscal efectiva (SS empleado + IRPF) / salario bruto."""
    if gross <= 0:
        return 0.0

    # Cotización SS empleado (cap 2024 ~56 646 €/año)
    ss = min(gross, 56646) * 0.0635

    # Reducción por rendimientos del trabajo (art. 20 LIRPF, valores 2025)
    rnp = max(0.0, gross - ss - 2000)
    if rnp <= 19747.5:
        reduction = 7302.0
    elif rnp <= 32279.58:
        reduction = max(0.0, 7302.0 - 1.75 * (rnp - 19747.5))
    else:
        reduction = 0.0

    base = max(0.0, rnp - reduction)

    cuota_integra = apply_brackets(base, STATE_BRACKETS) + apply_brackets(base, regional)

    minimo = 5550.0
    cuota_minimo = (apply_brackets(minimo, STATE_BRACKETS)
                    + apply_brackets(minimo, regional))

    irpf = max(0.0, cuota_integra - cuota_minimo)
    return (ss + irpf) / gross


def calc_rallo(gross, flat_rate=0.20, exemption=12000.0):
    """
    Propuesta Rallo: impuesto único al tipo flat_rate sobre la renta bruta
    por encima del mínimo exento. Reemplaza IRPF + cotizaciones SS del empleado.
    Para rentas por debajo del umbral: impuesto negativo (se recibe subsidio),
    representado aquí como tasa negativa.
    """
    if gross <= 0:
        return 0.0
    tax = (gross - exemption) * flat_rate
    return tax / gross


# ──────────────────────────────────────────────────────────────
# Cálculo para cada tramo salarial
# ──────────────────────────────────────────────────────────────
salaries  = np.array(sorted(DIST_RAW.keys()))
dist_vals = np.array([DIST_RAW[s] for s in salaries])

current_default = np.array([calc_current(s, DEFAULT_BRACKETS) for s in salaries])
rallo_rates     = np.array([calc_rallo(s, flat_rate=0.05)  for s in salaries])

# ──────────────────────────────────────────────────────────────
# Gráfico
# ──────────────────────────────────────────────────────────────
fig, ax1 = plt.subplots(figsize=(13, 7))
fig.patch.set_facecolor('#f9f9f7')
ax1.set_facecolor('#f9f9f7')

# Eje secundario: distribución salarial
ax2 = ax1.twinx()
ax2.fill_between(salaries, dist_vals, alpha=0.12, color='#888', label='Distribución salarial (eje der.)')
ax2.set_ylabel('% de trabajadores en cada tramo', color='#888', fontsize=10)
ax2.tick_params(axis='y', labelcolor='#888')
ax2.set_ylim(0, 22)
ax2.spines['right'].set_color('#ccc')

# Líneas de carga fiscal
ax1.plot(salaries, current_default * 100, color='#1a5fa8', lw=2.5,
         label='Sistema actual – media nacional')
ax1.plot(salaries, rallo_rates     * 100, color='#c0392b', lw=2.5,
         linestyle='-', label='Propuesta Rallo (5 % sobre la renta, exento 12 000 €)')

ax1.axhline(0, color='#333', lw=0.7, ls=':')

# Etiquetas en extremo de líneas
for s in [80000, 100000]:
    idx = np.searchsorted(salaries, s)
    if idx < len(salaries):
        ax1.annotate(f'{current_default[idx]*100:.0f}%',
                     xy=(salaries[idx], current_default[idx]*100),
                     xytext=(3, 4), textcoords='offset points',
                     color='#1a5fa8', fontsize=8.5, fontweight='bold')
        ax1.annotate(f'{rallo_rates[idx]*100:.0f}%',
                     xy=(salaries[idx], rallo_rates[idx]*100),
                     xytext=(3, -12), textcoords='offset points',
                     color='#c0392b', fontsize=8.5, fontweight='bold')

# Zona de impuesto negativo (Rallo)
ax1.fill_between(salaries, rallo_rates * 100, 0,
                 where=(rallo_rates < 0), alpha=0.18,
                 color='#27ae60', label='Subsidio neto (impuesto negativo)')

# Decoración
ax1.set_xlabel('Salario bruto anual (€)', fontsize=11)
ax1.set_ylabel('% del salario bruto que va al Estado', fontsize=11)
ax1.set_title(
    'Carga fiscal sobre el trabajo según salario bruto · 2024\n'
    'Sistema actual vs Propuesta Rallo',
    fontsize=13, fontweight='bold', pad=14)

ax1.set_xlim(0, 100000)
ax1.set_ylim(-8, 48)
ax1.yaxis.set_major_formatter(mtick.PercentFormatter(decimals=0))
ax1.xaxis.set_major_formatter(
    mtick.FuncFormatter(lambda x, _: f'{int(x):,} €'.replace(',', '.')))
ax1.tick_params(axis='x', rotation=30)

# Leyenda combinada
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2,
           loc='upper left', fontsize=9.5, framealpha=0.9)

# Nota metodológica
fig.text(
    0.5, 0.005,
    'Sistema actual: SS empleado (6,35 %, cap ≈ 56 646 €) + IRPF progresivo. '
    'Asalariado, soltero, sin hijos, sin pensión. Escala autonómica genérica (media nacional). | '
    'Propuesta Rallo: 5 % sobre la renta bruta, mínimo exento 12 000 €, sin cotizaciones SS separadas. '
    'No incluye tasas por servicios. Rentas por debajo del umbral reciben subsidio (impuesto negativo).',
    ha='center', fontsize=7.5, color='#555',
    wrap=True)

plt.tight_layout(rect=[0, 0.04, 1, 1])
plt.savefig('chart_rallo.png', dpi=150, bbox_inches='tight')
print('Gráfico guardado en chart_rallo.png')
plt.show()
