/**
 * Utilidades financieras compartidas entre cliente y servidor.
 * Mantenidas aquí para reutilización y optimización.
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatPercent = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "percent",
    minimumFractionDigits: 2,
  }).format((amount || 0) / 100);
};

export type ExpenseCategory =
  | "Hormiga"
  | "Fijo"
  | "Variable Esencial"
  | "Variable Prescindible"
  | "Otro Gasto";

export type TransactionType = "ingreso" | "gasto" | "inversion";
export type TransactionOwner = "persona1" | "persona2" | "pareja";
export type PaymentMethod =
  | "efectivo"
  | "transferencia"
  | "tc"
  | "billetera";

/**
 * Categoriza automáticamente un gasto según palabras clave.
 * Optimizado con regex precompiladas para evitar recompilación en cada llamada.
 */
const CATEGORY_RULES: Array<{ regex: RegExp; category: ExpenseCategory }> = [
  {
    regex:
      /(café|cafe|kiosco|golosina|propina|helado|snack|agua|peaje|factura|media|choripan|empanada)/i,
    category: "Hormiga",
  },
  {
    regex:
      /(alquiler|expensas|internet|luz|gas|seguro|colegio|prepaga|arca|afip|monotributo|patente|impuesto|abl|streaming|netflix|spotify|youtube|cable)/i,
    category: "Fijo",
  },
  {
    regex:
      /(supermercado|super|farmacia|transporte|sube|nafta|combustible|carniceria|verdulería|verduleria|medicamento|veneta|disco|coto|carrefour|dia)/i,
    category: "Variable Esencial",
  },
  {
    regex:
      /(salida|cine|ropa|restaurante|delivery|pedidosya|rappi|suscripcion|juego|recital|viaje|bar|show|birra|cerveza|whatsapp)/i,
    category: "Variable Prescindible",
  },
];

export const autoCategorizeExpense = (desc: string): ExpenseCategory => {
  for (const rule of CATEGORY_RULES) {
    if (rule.regex.test(desc)) return rule.category;
  }
  return "Otro Gasto";
};

/**
 * Determina la categoría según el tipo de transacción.
 */
export const resolveCategory = (
  type: TransactionType,
  desc: string
): string => {
  if (type === "ingreso") return "Ingresos";
  if (type === "inversion") return "Inversiones";
  return autoCategorizeExpense(desc);
};

/**
 * Colores por categoría (clases Tailwind) - usados tanto en barras como en badges.
 */
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Hormiga: "bg-orange-400",
  Fijo: "bg-blue-500",
  "Variable Esencial": "bg-emerald-400",
  "Variable Prescindible": "bg-purple-400",
  "Otro Gasto": "bg-slate-300",
};

export const CATEGORY_BADGE_COLORS: Record<ExpenseCategory, string> = {
  Hormiga: "bg-orange-100 text-orange-700",
  Fijo: "bg-blue-100 text-blue-700",
  "Variable Esencial": "bg-emerald-100 text-emerald-700",
  "Variable Prescindible": "bg-purple-100 text-purple-700",
  "Otro Gasto": "bg-slate-100 text-slate-700",
};
