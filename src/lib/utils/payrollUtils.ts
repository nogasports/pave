import { FinanceSettings } from '../firebase/finance';

export interface SalaryComponents {
  baseSalary: number;
  allowances: {
    transport: number;
    housing: number;
    position: number;
  };
  deductions: {
    tax: number;
    pension: number;
    other: number;
  };
  overtime?: {
    hours: number;
    rate: number;
    amount: number;
  };
}

export interface PayrollCalculation extends SalaryComponents {
  grossSalary: number;
  netSalary: number;
  taxableIncome: number;
  pensionContribution: {
    employee: number;
    employer: number;
  };
}

export const calculatePayroll = (
  data: SalaryComponents,
  settings: FinanceSettings
): PayrollCalculation => {
  // Calculate total allowances
  const totalAllowances = 
    data.allowances.transport +
    data.allowances.housing +
    data.allowances.position;

  // Calculate overtime if present
  const overtimeAmount = data.overtime?.amount || 0;

  // Calculate gross salary
  const grossSalary = data.baseSalary + totalAllowances + overtimeAmount;

  // Calculate taxable income (gross salary minus pension contribution)
  const employeePensionAmount = (data.baseSalary * settings.pensionRate) / 100;
  const employerPensionAmount = (data.baseSalary * settings.employerPensionRate) / 100;
  const taxableIncome = grossSalary - employeePensionAmount;

  // Calculate tax using brackets
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of settings.taxBrackets) {
    if (remainingIncome <= 0) break;

    const bracketAmount = Math.min(
      remainingIncome,
      bracket.to === Infinity ? remainingIncome : bracket.to - bracket.from
    );

    tax += (bracketAmount * bracket.rate) / 100;
    remainingIncome -= bracketAmount;
  }

  // Calculate total deductions
  const totalDeductions = 
    tax +
    employeePensionAmount +
    (data.deductions.other || 0);

  // Calculate net salary
  const netSalary = grossSalary - totalDeductions;

  return {
    ...data,
    grossSalary,
    netSalary,
    taxableIncome,
    pensionContribution: {
      employee: employeePensionAmount,
      employer: employerPensionAmount
    },
    deductions: {
      ...data.deductions,
      tax,
      pension: employeePensionAmount
    }
  };
};

export const calculateDefaultAllowances = (
  isManager: boolean,
  settings: FinanceSettings
) => ({
  transport: settings.allowances.transport.default + (isManager ? settings.allowances.transport.managerBonus : 0),
  housing: settings.allowances.housing.default + (isManager ? settings.allowances.housing.managerBonus : 0),
  position: settings.allowances.position.default + (isManager ? settings.allowances.position.managerBonus : 0)
});

export const calculateNetSalary = (data: PayrollCalculation, settings?: FinanceSettings): number => {
  // Calculate total allowances
  const totalAllowances = 
    data.allowances.transport +
    data.allowances.housing +
    data.allowances.position;

  // Calculate tax based on tax brackets if settings are provided
  let taxAmount = data.deductions.tax;
  if (settings?.taxBrackets) {
    const taxableIncome = data.baseSalary + totalAllowances;
    taxAmount = calculateTax(taxableIncome, settings.taxBrackets);
  }

  // Calculate pension based on settings
  let pensionAmount = data.deductions.pension;
  if (settings?.pensionRate) {
    pensionAmount = (data.baseSalary * settings.pensionRate) / 100;
  }

  // Calculate total deductions
  const totalDeductions =
    taxAmount +
    pensionAmount +
    data.deductions.other;

  // Calculate overtime amount if present
  const overtimeAmount = data.overtime ? data.overtime.amount : 0;

  // Calculate net salary
  const netSalary = 
    data.baseSalary +
    totalAllowances +
    overtimeAmount -
    totalDeductions;

  // Round to 2 decimal places
  return Math.round(netSalary * 100) / 100;
};

const calculateTax = (income: number, brackets: { from: number; to: number; rate: number }[]): number => {
  let tax = 0;
  let remainingIncome = income;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const bracketAmount = Math.min(
      remainingIncome,
      bracket.to === Infinity ? remainingIncome : bracket.to - bracket.from
    );

    tax += (bracketAmount * bracket.rate) / 100;
    remainingIncome -= bracketAmount;
  }

  return Math.round(tax * 100) / 100;
};