export type DealInput = {
  purchasePrice: number;
  rentMonthly: number;
  chargesMonthly: number;
  taxeFonciereYearly: number;
  interestRate: number;
  durationYears: number;
  downPayment: number;
  // Nouvelles fonctionnalités Premium
  managementFeesPercent?: number; // % des loyers annuels
  rentalInsuranceMonthly?: number; // Garantie loyer impayé
  sourceWithholdingRate?: number; // Taux prélèvement à la source (%)
  socialContributionsRate?: number; // Prélèvements sociaux (%)
};

export function monthlyLoanPayment(
  principal: number,
  annualRatePercent: number,
  years: number
): number {
  const annualRate = annualRatePercent / 100;
  const r = annualRate / 12;
  const n = years * 12;
  if (!principal || !years) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function grossYield(input: DealInput): number {
  const { purchasePrice, rentMonthly } = input;
  return purchasePrice ? (rentMonthly * 12 * 100) / purchasePrice : 0;
}

export function netYield(input: DealInput): number {
  const { purchasePrice, rentMonthly, chargesMonthly, taxeFonciereYearly } = input;
  const yearlyRent = rentMonthly * 12;
  const yearlyCharges = chargesMonthly * 12 + taxeFonciereYearly;
  return purchasePrice ? ((yearlyRent - yearlyCharges) * 100) / purchasePrice : 0;
}

export function monthlyCashflow(input: DealInput): number {
  const {
    purchasePrice,
    downPayment,
    rentMonthly,
    chargesMonthly,
    taxeFonciereYearly,
    interestRate,
    durationYears,
    managementFeesPercent = 0,
    rentalInsuranceMonthly = 0,
    sourceWithholdingRate = 0,
    socialContributionsRate = 0,
  } = input;

  const principal = Math.max(0, purchasePrice - downPayment);
  const loan = monthlyLoanPayment(principal, interestRate, durationYears);
  const taxeMensuelle = taxeFonciereYearly / 12;
  
  // Frais de gestion (% des loyers annuels / 12)
  const managementFees = (rentMonthly * managementFeesPercent) / 100;
  
  // Impôts (prélèvement à la source + sociaux)
  const withholding = (rentMonthly * sourceWithholdingRate) / 100;
  const socialFees = (rentMonthly * socialContributionsRate) / 100;

  return rentMonthly - chargesMonthly - taxeMensuelle - loan - managementFees - rentalInsuranceMonthly - withholding - socialFees;
}

export function dealScore(input: DealInput): number {
  const gy = grossYield(input);
  const ny = netYield(input);
  const cf = monthlyCashflow(input);

  let score = 50;

  if (gy > 10) score += 15;
  else if (gy > 8) score += 10;
  else if (gy > 6) score += 5;
  else score -= 5;

  if (ny > 8) score += 15;
  else if (ny > 6) score += 10;
  else if (ny > 4) score += 5;
  else score -= 5;

  if (cf >= 200) score += 15;
  else if (cf >= 50) score += 10;
  else if (cf >= 0) score += 5;
  else score -= 10;

  return Math.max(0, Math.min(100, score));
}

// ===== NOUVELLES FONCTIONNALITÉS PREMIUM =====

export function managementFeesYearly(input: DealInput): number {
  const { rentMonthly, managementFeesPercent = 0 } = input;
  return (rentMonthly * 12 * managementFeesPercent) / 100;
}

export function rentalInsuranceYearly(input: DealInput): number {
  const { rentalInsuranceMonthly = 0 } = input;
  return rentalInsuranceMonthly * 12;
}

export function sourceWithholdingYearly(input: DealInput): number {
  const { rentMonthly, sourceWithholdingRate = 0 } = input;
  return (rentMonthly * 12 * sourceWithholdingRate) / 100;
}

export function socialContributionsYearly(input: DealInput): number {
  const { rentMonthly, socialContributionsRate = 0 } = input;
  return (rentMonthly * 12 * socialContributionsRate) / 100;
}

export function totalTaxesAndFeesYearly(input: DealInput): number {
  return managementFeesYearly(input) + rentalInsuranceYearly(input) + sourceWithholdingYearly(input) + socialContributionsYearly(input);
}
