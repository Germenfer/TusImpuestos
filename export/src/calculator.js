// Simplified Spanish IRPF calculator for 2026.
// Approximation — NOT an official tax engine. Used for live UI feedback only.
//
// Sources: AEAT 2025 brackets (extrapolated), Seguridad Social rates 2025–2026.
// Numbers are illustrative; do not use for actual tax filings.

(function () {
// State (estatal) brackets — 50% of total tax
const STATE_BRACKETS = [
  { up: 12450,  rate: 0.095 },
  { up: 20200,  rate: 0.12 },
  { up: 35200,  rate: 0.15 },
  { up: 60000,  rate: 0.185 },
  { up: 300000, rate: 0.225 },
  { up: Infinity, rate: 0.245 },
];

// Autonomic brackets per region. Madrid is the lightest, Cataluña the heaviest.
// Each entry: { up, rate }, applied to the same base as the state brackets.
const REGIONAL_BRACKETS = {
  'madrid': [
    { up: 13362,  rate: 0.085 },
    { up: 19004,  rate: 0.107 },
    { up: 35425,  rate: 0.128 },
    { up: 57320,  rate: 0.174 },
    { up: Infinity, rate: 0.205 },
  ],
  'cataluna': [
    { up: 12450,  rate: 0.105 },
    { up: 17707,  rate: 0.12 },
    { up: 21000,  rate: 0.14 },
    { up: 33007,  rate: 0.15 },
    { up: 53407,  rate: 0.188 },
    { up: 90000,  rate: 0.215 },
    { up: 120000, rate: 0.235 },
    { up: 175000, rate: 0.245 },
    { up: Infinity, rate: 0.255 },
  ],
  'andalucia': [
    { up: 13000,  rate: 0.095 },
    { up: 21000,  rate: 0.12 },
    { up: 35200,  rate: 0.15 },
    { up: 60000,  rate: 0.185 },
    { up: Infinity, rate: 0.225 },
  ],
  'valencia': [
    { up: 12000,  rate: 0.09 },
    { up: 22000,  rate: 0.12 },
    { up: 32000,  rate: 0.15 },
    { up: 42000,  rate: 0.175 },
    { up: 62000,  rate: 0.20 },
    { up: 82000,  rate: 0.225 },
    { up: 122000, rate: 0.25 },
    { up: 175000, rate: 0.27 },
    { up: Infinity, rate: 0.295 },
  ],
  'galicia': [
    { up: 12985,  rate: 0.09 },
    { up: 21068,  rate: 0.118 },
    { up: 35200,  rate: 0.15 },
    { up: 60000,  rate: 0.184 },
    { up: Infinity, rate: 0.225 },
  ],
  'pais-vasco': [ // Foral — simplified default
    { up: 16030,  rate: 0.23 },
    { up: 31920,  rate: 0.28 },
    { up: 47600,  rate: 0.35 },
    { up: 67770,  rate: 0.40 },
    { up: 95880,  rate: 0.45 },
    { up: 142220, rate: 0.46 },
    { up: 179460, rate: 0.47 },
    { up: Infinity, rate: 0.49 },
  ],
  'default': [
    { up: 12450,  rate: 0.095 },
    { up: 20200,  rate: 0.12 },
    { up: 35200,  rate: 0.15 },
    { up: 60000,  rate: 0.185 },
    { up: 300000, rate: 0.225 },
    { up: Infinity, rate: 0.245 },
  ],
};

const REGIONS = [
  { id: 'madrid',     label: 'Madrid' },
  { id: 'cataluna',   label: 'Cataluña' },
  { id: 'andalucia',  label: 'Andalucía' },
  { id: 'valencia',   label: 'C. Valenciana' },
  { id: 'galicia',    label: 'Galicia' },
  { id: 'pais-vasco', label: 'País Vasco' },
  { id: 'default',    label: 'Otra' },
];

function applyBrackets(base, brackets) {
  if (base <= 0) return 0;
  let remaining = base;
  let prev = 0;
  let total = 0;
  for (const { up, rate } of brackets) {
    const slice = Math.min(remaining, up - prev);
    if (slice <= 0) break;
    total += slice * rate;
    remaining -= slice;
    prev = up;
    if (remaining <= 0) break;
  }
  return total;
}

// Personal + family minimums (simplified)
function calcMinimoPersonal({ age, children, disability }) {
  let mp = 5550;
  if (age >= 65) mp += 1150;
  if (age >= 75) mp += 1400;
  const childMins = [2400, 2700, 4000, 4500];
  let mf = 0;
  for (let i = 0; i < children; i++) {
    mf += childMins[Math.min(i, 3)];
  }
  if (disability === 'mild')   mp += 3000;
  if (disability === 'severe') mp += 9000;
  return mp + mf;
}

// Asalariado: SS = 6.48% of gross (employee share), with a base cap.
// Cap (2025): max contribution base ~4,909.50 €/month ×12 ≈ 58,914 €/year.
function calcSocialSecurity(gross) {
  const cap = 58914;
  const base = Math.min(gross, cap);
  return base * 0.0648;
}

// Reducción por rendimientos del trabajo (article 20 LIRPF)
function calcWorkIncomeReduction(rendimientoNetoPrevio) {
  if (rendimientoNetoPrevio <= 14852) return 7302;
  if (rendimientoNetoPrevio <= 17673.52) {
    return 7302 - 1.75 * (rendimientoNetoPrevio - 14852);
  }
  return 0;
}

// Main entry point — pure function.
function calculate(input) {
  const {
    gross = 0,
    payments = 14,
    region = 'madrid',
    age = 32,
    status = 'soltero',
    children = 0,
    disability = 'none',
    pension = 0,
    employmentType = 'asalariado',
  } = input;

  const brackets = REGIONAL_BRACKETS[region] || REGIONAL_BRACKETS.default;

  if (employmentType === 'autonomo') {
    // Very simplified: flat annual cuota approximation by income bracket
    let cuota;
    if (gross < 14000)      cuota = 230 * 12;
    else if (gross < 22000) cuota = 294 * 12;
    else if (gross < 32000) cuota = 350 * 12;
    else if (gross < 50000) cuota = 405 * 12;
    else                    cuota = 530 * 12;

    const expenses = 0; // user could add later
    const rendimientoNeto = Math.max(0, gross - cuota - expenses);
    // Forfait deducción 5% para autónomos
    const rendNetoReducido = rendimientoNeto * 0.95 - Math.min(pension, 1500);
    const base = Math.max(0, rendNetoReducido);

    const cuotaEstatal = applyBrackets(base, STATE_BRACKETS);
    const cuotaAuton   = applyBrackets(base, brackets);
    const cuotaIntegra = cuotaEstatal + cuotaAuton;

    const minimoPersonal = calcMinimoPersonal({ age, children, disability });
    const cuotaMinimoEst = applyBrackets(minimoPersonal, STATE_BRACKETS);
    const cuotaMinimoAut = applyBrackets(minimoPersonal, brackets);
    const cuotaMinimo = cuotaMinimoEst + cuotaMinimoAut;

    const irpf = Math.max(0, cuotaIntegra - cuotaMinimo);
    const net = gross - cuota - irpf;
    const effective = gross > 0 ? irpf / gross : 0;
    const totalTax = irpf + cuota;
    const totalRate = gross > 0 ? totalTax / gross : 0;

    return {
      gross, net, irpf, ss: cuota,
      effective, totalRate,
      monthly: net / 12,
      perPayment: net / payments,
      employmentType,
      base, minimoPersonal,
      withholding: gross > 0 ? irpf / gross : 0,
    };
  }

  // Asalariado
  const ss = calcSocialSecurity(gross);
  const workExpense = 2000;
  const rendimientoNetoPrevio = Math.max(0, gross - ss - workExpense);
  const reduction = calcWorkIncomeReduction(rendimientoNetoPrevio);
  const rendimientoNeto = Math.max(0, rendimientoNetoPrevio - reduction);
  const pensionCap = Math.min(pension, 1500);
  const baseLiquidable = Math.max(0, rendimientoNeto - pensionCap);

  const cuotaEstatal = applyBrackets(baseLiquidable, STATE_BRACKETS);
  const cuotaAuton   = applyBrackets(baseLiquidable, brackets);
  const cuotaIntegra = cuotaEstatal + cuotaAuton;

  const minimoPersonal = calcMinimoPersonal({ age, children, disability });
  const cuotaMinimoEst = applyBrackets(minimoPersonal, STATE_BRACKETS);
  const cuotaMinimoAut = applyBrackets(minimoPersonal, brackets);
  const cuotaMinimo = cuotaMinimoEst + cuotaMinimoAut;

  const irpf = Math.max(0, cuotaIntegra - cuotaMinimo);
  const net = gross - ss - irpf;
  const effective = gross > 0 ? irpf / gross : 0;
  const totalTax = irpf + ss;
  const totalRate = gross > 0 ? totalTax / gross : 0;
  const withholding = gross > 0 ? irpf / gross : 0;

  return {
    gross, net, irpf, ss,
    effective, totalRate, withholding,
    monthly: net / 12,
    perPayment: net / payments,
    employmentType,
    base: baseLiquidable,
    minimoPersonal,
  };
}

// Currency / percent formatters — Spanish locale
const fmtEur  = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n || 0));
const fmtEur2 = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n || 0);
const fmtPct  = (n) => new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 1 }).format(n || 0);

// ─── Efectivo anual ────────────────────────────────────────
// Estimates the "real" disposable income after consumption + property + wealth taxes.
// Inputs (all optional, with smart defaults):
//   spendRate:   0..1 fraction of net that's spent (rest is saved)
//   tobacco:     'none' | 'occasional' | 'moderate' | 'heavy'
//   alcohol:     'none' | 'social' | 'regular' | 'heavy'
//   ownsHome:    bool
//   homeValue:   €  market value
//   mortgage:    €  outstanding (subtracted for wealth calc only, not IBI)
//   financialAssets: €  savings/investments
//   region:      same id used by calculate()

// Default % of net that gets spent. Fixed at 75% (user adjustable via slider).
function suggestedSpendRate(_net) {
  return 0.75;
}

// Wealth-tax regional bonification (1.0 = pays nothing, 0 = pays full)
const WEALTH_BONIF = {
  'madrid':    1.0,
  'andalucia': 1.0,
  'cataluna':  0,
  'valencia':  0,
  'galicia':   0.25,
  'pais-vasco': 0,
  'default':   0,
};

// Spain default wealth-tax brackets (state, simplified)
const WEALTH_BRACKETS = [
  { up:   167129, rate: 0.002 },
  { up:   334253, rate: 0.003 },
  { up:   668499, rate: 0.005 },
  { up:  1336999, rate: 0.009 },
  { up:  2673999, rate: 0.013 },
  { up:  5347998, rate: 0.017 },
  { up: 10695996, rate: 0.021 },
  { up: Infinity, rate: 0.035 },
];

// Effective weighted VAT rate on a typical consumer basket
// (mix of 21% general + 10% reduced + 4% super-reduced)
const VAT_RATE = 0.105;

function calculateEffective(taxResult, lifestyle = {}, region = 'default') {
  const net = taxResult.net || 0;
  const {
    spendRate,
    ownsHome = false,
    homeValue = 0,
    mortgage = 0,
    financialAssets = 0,
  } = lifestyle;

  const rate = (typeof spendRate === 'number') ? spendRate : suggestedSpendRate(net);
  const spending = Math.max(0, net * rate);
  // VAT is included in retail prices: VAT portion = spending * r/(1+r)
  const vat = spending * VAT_RATE / (1 + VAT_RATE);

  const ibi = ownsHome && homeValue > 0 ? homeValue * 0.005 : 0;

  // Wealth tax
  const homeNet = ownsHome ? Math.max(0, homeValue - mortgage) : 0;
  const totalWealth = homeNet + Math.max(0, financialAssets);
  // Exemption: 700k base + up to 300k habitual residence
  const homeExemption = ownsHome ? Math.min(300000, homeNet) : 0;
  const exemption = 700000 + homeExemption;
  const taxable = Math.max(0, totalWealth - exemption);
  const bonif = WEALTH_BONIF[region] ?? 0;
  let patrimonio = 0;
  if (taxable > 0) {
    patrimonio = applyBrackets(taxable, WEALTH_BRACKETS) * (1 - bonif);
  }

  const consumption = vat;
  const property = ibi + patrimonio;
  const totalExtra = consumption + property;
  const effective = net - totalExtra;
  const effectiveMonthly = effective / 12;

  const gross = taxResult.gross || 0;
  const totalTaxes = (taxResult.irpf || 0) + (taxResult.ss || 0) + totalExtra;
  const totalRate = gross > 0 ? totalTaxes / gross : 0;

  return {
    spendRate: rate, suggestedSpendRate: suggestedSpendRate(net),
    spending,
    vat, ibi, patrimonio,
    consumption, property,
    totalExtra, effective, effectiveMonthly,
    totalTaxes, totalRate,
    totalWealth, taxableWealth: taxable, wealthBonif: bonif,
  };
}

// Expose to window for non-module consumers
window.TaxCalc = { calculate, calculateEffective, suggestedSpendRate, REGIONS, fmtEur, fmtEur2, fmtPct };
})();
