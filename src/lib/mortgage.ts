/**
 * Odhad mesačnej splátky — prenesené 1:1 z
 * `/root/offerra/src/lib/mortgage.ts` (appka), čistá funkcia, žiadna
 * zmena. ZÁMERNE „odhad", nie „výpočet" — nezohľadňuje poplatky,
 * poistenie, daň ani to, či banka úver schváli.
 */
export type MortgageInput = {
  price: number;
  downPaymentPct: number;
  ratePct: number;
  years: number;
};

export type MortgageResult = {
  loan: number;
  downPayment: number;
  monthly: number;
  totalPaid: number;
  totalInterest: number;
};

export function computeMortgage({ price, downPaymentPct, ratePct, years }: MortgageInput): MortgageResult {
  const downPayment = Math.round((price * downPaymentPct) / 100);
  const loan = Math.max(0, price - downPayment);
  const n = Math.max(1, Math.round(years * 12));
  const i = ratePct / 100 / 12;

  const monthly = i === 0 ? loan / n : (loan * i) / (1 - Math.pow(1 + i, -n));
  const totalPaid = monthly * n;

  return {
    loan,
    downPayment,
    monthly: Math.round(monthly),
    totalPaid: Math.round(totalPaid),
    totalInterest: Math.round(totalPaid - loan),
  };
}

export function eur(v: number): string {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v);
}
