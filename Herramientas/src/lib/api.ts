import type {
  Transaction,
  Goal,
  Reminder,
  DashboardData,
  UserSettings,
  ChartData,
  ScannedReceipt,
  TransactionOwner,
} from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Cliente API simulado.
 * Usa window.localStorage ("finanzas-ar-data") en lugar de endpoints de red
 * para permitir que la app sea 100% estática y funcione sin backend.
 */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Simulador de delay de red para que los loaders (spinners) funcionen visualmente bien.
async function simulateNetworkDelay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ====== Helper para Leer/Escribir Datos Locales ======
interface LocalStorageData {
  transactions: Transaction[];
  goals: Goal[];
  reminders: Reminder[];
  settings: UserSettings;
}

const DEFAULT_SETTINGS: UserSettings = {
  id: "local",
  name: "Usuario",
  email: "local@estatico",
  persona1Name: "Persona 1",
  persona2Name: "Persona 2",
  showPersona1: true,
  showPersona2: true,
  whatsappEnabled: false,
  whatsappNumber: null,
};

function getLocalData(): LocalStorageData {
  if (typeof window === "undefined") {
    return { transactions: [], goals: [], reminders: [], settings: DEFAULT_SETTINGS };
  }
  const raw = window.localStorage.getItem("finanzas-ar-data");
  if (!raw) {
    const defaultData = {
      transactions: [],
      goals: [],
      reminders: [],
      settings: DEFAULT_SETTINGS,
    };
    window.localStorage.setItem("finanzas-ar-data", JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    const data = JSON.parse(raw);
    if (!data.settings) data.settings = DEFAULT_SETTINGS;
    return data;
  } catch (e) {
    console.error("Error parsing local storage data", e);
    return { transactions: [], goals: [], reminders: [], settings: DEFAULT_SETTINGS };
  }
}

function setLocalData(data: LocalStorageData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("finanzas-ar-data", JSON.stringify(data));
  }
}

// ============ AUTH (Simulado) ============

export const authApi = {
  register: async (name: string, email: string, password: string) => {
    await simulateNetworkDelay();
    return { ok: true, user: { id: "local", email, name } };
  },
};

// ============ Transactions ============

export const transactionsApi = {
  list: async (params?: { type?: string; owner?: string; limit?: number }) => {
    await simulateNetworkDelay(100);
    const data = getLocalData();
    let result = [...data.transactions];
    
    // Sort descending by date
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (params?.type) {
      result = result.filter((t) => t.type === params.type);
    }
    if (params?.owner) {
      result = result.filter((t) => t.owner === params.owner);
    }
    if (params?.limit) {
      result = result.slice(0, params.limit);
    }
    return result;
  },

  create: async (input: Omit<Transaction, "id">) => {
    await simulateNetworkDelay();
    const data = getLocalData();
    const newTx: Transaction = {
      id: uuidv4(),
      ...input,
    };
    data.transactions.push(newTx);
    setLocalData(data);
    return newTx;
  },

  update: async (id: string, input: Partial<Transaction>) => {
    await simulateNetworkDelay();
    const data = getLocalData();
    const idx = data.transactions.findIndex((t) => t.id === id);
    if (idx === -1) throw new ApiError("Transacción no encontrada", 404);
    
    const updated = { ...data.transactions[idx], ...input };
    data.transactions[idx] = updated;
    setLocalData(data);
    return updated;
  },

  remove: async (id: string) => {
    await simulateNetworkDelay();
    const data = getLocalData();
    data.transactions = data.transactions.filter((t) => t.id !== id);
    setLocalData(data);
    return { ok: true };
  },
};

// ============ Goals ============

export const goalsApi = {
  list: async () => {
    await simulateNetworkDelay();
    return getLocalData().goals;
  },

  create: async (input: Omit<Goal, "id" | "currentAmount"> & { currentAmount?: number }) => {
    await simulateNetworkDelay();
    const data = getLocalData();
    const newGoal: Goal = {
      id: uuidv4(),
      currentAmount: 0,
      ...input,
    };
    data.goals.push(newGoal);
    setLocalData(data);
    return newGoal;
  },

  update: async (id: string, input: Partial<Goal> & { addAmount?: number }) => {
    await simulateNetworkDelay();
    const data = getLocalData();
    const idx = data.goals.findIndex((t) => t.id === id);
    if (idx === -1) throw new ApiError("Meta no encontrada", 404);
    
    const goal = data.goals[idx];
    if (input.addAmount) {
      goal.currentAmount += input.addAmount;
    } else {
      Object.assign(goal, input);
    }
    data.goals[idx] = goal;
    setLocalData(data);
    return goal;
  },

  remove: async (id: string) => {
    await simulateNetworkDelay();
    const data = getLocalData();
    data.goals = data.goals.filter((t) => t.id !== id);
    setLocalData(data);
    return { ok: true };
  },
};

// ============ Reminders ============

export const remindersApi = {
  list: async () => {
    await simulateNetworkDelay();
    return getLocalData().reminders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  create: async (input: Omit<Reminder, "id" | "notified">) => {
    await simulateNetworkDelay();
    const data = getLocalData();
    const newReminder: Reminder = {
      id: uuidv4(),
      notified: false,
      ...input,
    };
    data.reminders.push(newReminder);
    setLocalData(data);
    return newReminder;
  },

  update: async (id: string, input: Partial<Reminder>) => {
    await simulateNetworkDelay();
    const data = getLocalData();
    const idx = data.reminders.findIndex((t) => t.id === id);
    if (idx === -1) throw new ApiError("Recordatorio no encontrado", 404);
    
    data.reminders[idx] = { ...data.reminders[idx], ...input };
    setLocalData(data);
    return data.reminders[idx];
  },

  remove: async (id: string) => {
    await simulateNetworkDelay();
    const data = getLocalData();
    data.reminders = data.reminders.filter((t) => t.id !== id);
    setLocalData(data);
    return { ok: true };
  },
};

// ============ Dashboard ============

export const dashboardApi = {
  get: async (): Promise<DashboardData> => {
    await simulateNetworkDelay();
    const data = getLocalData();
    
    let ingresos = 0, gastos = 0, inversiones = 0;
    const gastosPorCategoria: Record<string, number> = {};
    const coupleStats = {
      persona1: { ingresos: 0, gastos: 0 },
      persona2: { ingresos: 0, gastos: 0 },
      pareja: { gastos: 0 },
      saldoP1: 0,
      saldoP2: 0,
    };

    data.transactions.forEach(t => {
      // Global stats
      if (t.type === "ingreso") ingresos += t.amount;
      if (t.type === "gasto") {
        gastos += t.amount;
        gastosPorCategoria[t.category] = (gastosPorCategoria[t.category] || 0) + t.amount;
      }
      if (t.type === "inversion") inversiones += t.amount;

      // Couple stats
      if (t.owner === "persona1") {
        if (t.type === "ingreso") coupleStats.persona1.ingresos += t.amount;
        if (t.type === "gasto") coupleStats.persona1.gastos += t.amount;
      } else if (t.owner === "persona2") {
        if (t.type === "ingreso") coupleStats.persona2.ingresos += t.amount;
        if (t.type === "gasto") coupleStats.persona2.gastos += t.amount;
      } else if (t.owner === "pareja") {
        if (t.type === "gasto") coupleStats.pareja.gastos += t.amount;
      }
    });

    coupleStats.saldoP1 = coupleStats.persona1.ingresos - coupleStats.persona1.gastos - (coupleStats.pareja.gastos / 2);
    coupleStats.saldoP2 = coupleStats.persona2.ingresos - coupleStats.persona2.gastos - (coupleStats.pareja.gastos / 2);

    return {
      summary: {
        ingresos,
        gastos,
        inversiones,
        balance: ingresos - gastos,
        gastosPorCategoria
      },
      coupleStats,
      counts: {
        goals: data.goals.length,
        upcomingReminders: data.reminders.length,
        totalTransactions: data.transactions.length
      }
    };
  },
};

// ============ Seed ============

export const seedApi = {
  load: async () => {
    await simulateNetworkDelay(500);
    const data = getLocalData();
    
    // Solo carga datos si está vacío
    if (data.transactions.length === 0) {
      data.transactions = [
        { id: uuidv4(), date: new Date().toISOString(), desc: "Sueldo", amount: 1500000, type: "ingreso", method: "transferencia", category: "Ingresos", owner: "persona1" },
        { id: uuidv4(), date: new Date().toISOString(), desc: "Supermercado", amount: 120000, type: "gasto", method: "tc", category: "Variable Esencial", owner: "pareja" }
      ];
      data.goals = [
        { id: uuidv4(), title: "Vacaciones", currentAmount: 200000, targetAmount: 1000000, owner: "pareja", type: "Ahorro" }
      ];
      data.reminders = [
        { id: uuidv4(), title: "Alquiler", amount: 350000, date: new Date(Date.now() + 86400000 * 5).toISOString(), notified: false }
      ];
      setLocalData(data);
    }
    return { ok: true, message: "Datos de prueba cargados." };
  },
};

// ============ User Settings ============

export const userApi = {
  getSettings: async () => {
    await simulateNetworkDelay();
    return getLocalData().settings;
  },

  updateSettings: async (input: Partial<UserSettings>) => {
    await simulateNetworkDelay();
    const data = getLocalData();
    data.settings = { ...data.settings, ...input };
    setLocalData(data);
    return data.settings;
  },

  updateProfile: async (input: { name: string; email: string }) => {
    await simulateNetworkDelay();
    const data = getLocalData();
    data.settings.name = input.name;
    data.settings.email = input.email;
    setLocalData(data);
    return { id: "local", name: input.name, email: input.email };
  },

  updatePassword: async (input: {
    currentPassword: string;
    newPassword: string;
  }) => {
    await simulateNetworkDelay();
    // Simulado: siempre exitoso ya que es estático y no usa pass.
    return { ok: true };
  },
};

// ============ Charts ============

export const chartsApi = {
  get: async (): Promise<ChartData> => {
    await simulateNetworkDelay();
    const data = getLocalData();
    const byCategory: Record<string, number> = {};
    const byMonthMap: Record<string, any> = {};

    data.transactions.forEach(t => {
      if (t.type === "gasto") {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      }
      
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // e.g. "2024-5"
      if (!byMonthMap[monthKey]) {
        byMonthMap[monthKey] = { month: monthKey, label: date.toLocaleString('es', { month: 'short' }), ingresos: 0, gastos: 0, inversiones: 0 };
      }
      if (t.type === "ingreso") byMonthMap[monthKey].ingresos += t.amount;
      if (t.type === "gasto") byMonthMap[monthKey].gastos += t.amount;
      if (t.type === "inversion") byMonthMap[monthKey].inversiones += t.amount;
    });

    return {
      byCategory,
      byMonth: Object.values(byMonthMap)
    };
  },
};

// ============ Receipts (VLM) ============

export const receiptsApi = {
  scan: async (image: string, owner?: TransactionOwner) => {
    // Disabled functionality, just throw error to prevent use
    throw new ApiError("El escaneo de tickets requiere un servidor. Funcionalidad deshabilitada en versión estática.", 501);
  },
};
