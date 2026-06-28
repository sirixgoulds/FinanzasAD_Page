// Tipos compartidos entre cliente y servidor

export type TransactionType = "ingreso" | "gasto" | "inversion";
export type TransactionOwner = "persona1" | "persona2" | "pareja";
export type PaymentMethod = "efectivo" | "transferencia" | "tc" | "billetera";
export type ExpenseCategory =
  | "Hormiga"
  | "Fijo"
  | "Variable Esencial"
  | "Variable Prescindible"
  | "Otro Gasto"
  | "Ingresos"
  | "Inversiones";

export interface Transaction {
  id: string;
  date: string;
  desc: string;
  amount: number;
  type: TransactionType;
  method: PaymentMethod;
  category: string;
  owner: TransactionOwner;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  owner: TransactionOwner;
  type: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  amount: number;
  notified: boolean;
}

export interface DashboardSummary {
  ingresos: number;
  gastos: number;
  inversiones: number;
  balance: number;
  gastosPorCategoria: Record<string, number>;
}

export interface CoupleStats {
  persona1: { ingresos: number; gastos: number };
  persona2: { ingresos: number; gastos: number };
  pareja: { gastos: number };
  saldoP1: number;
  saldoP2: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  coupleStats: CoupleStats;
  counts: {
    goals: number;
    upcomingReminders: number;
    totalTransactions: number;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface UserSettings {
  id: string;
  name: string | null;
  email: string;
  persona1Name: string;
  persona2Name: string;
  showPersona1: boolean;
  showPersona2: boolean;
  whatsappEnabled: boolean;
  whatsappNumber: string | null;
}

export interface ChartData {
  byCategory: Record<string, number>;
  byMonth: Array<{
    month: string;
    label: string;
    ingresos: number;
    gastos: number;
    inversiones: number;
  }>;
}

export interface ScannedReceipt {
  amount: number;
  desc: string;
  date: string;
  type: "ingreso" | "gasto";
  method: PaymentMethod;
  category: string;
  owner: TransactionOwner;
}
