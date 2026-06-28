/**
 * Registro central de todas las herramientas financieras disponibles.
 * Cada herramienta tiene un id, título, descripción, ícono y categoría.
 */

import type { ComponentType } from "react";
import {
  Percent,
  TrendingUp,
  Smartphone,
  CreditCard,
  DollarSign,
  Tag,
  Bell,
  PieChart,
  Repeat,
  Shield,
  Gauge,
  Landmark,
  Snowflake,
} from "lucide-react";

export type ToolId =
  | "tna-tea"
  | "interes-compuesto"
  | "billeteras"
  | "cuotas-cft"
  | "conversor-dolar"
  | "categorizador"
  | "alertas-vencimientos"
  | "presupuesto-50-30-20"
  | "suscripciones"
  | "fondo-emergencia"
  | "inflacion-ipc"
  | "prestamos-frances"
  | "bola-nieve";

export interface ToolDef {
  id: ToolId;
  title: string;
  shortTitle: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  category: "Rendimientos" | "Préstamos y Deudas" | "Presupuesto" | "Utilidades";
  /** Si es true, es una herramienta que redirige a otra sección de la app */
  externalLink?: string;
}

export const TOOLS: ToolDef[] = [
  {
    id: "tna-tea",
    title: "Calculadora de TNA a TEA",
    shortTitle: "TNA a TEA",
    description:
      "Medí el rendimiento real de billeteras virtuales a 1 día frente a plazos fijos a 30 días.",
    icon: Percent,
    category: "Rendimientos",
  },
  {
    id: "interes-compuesto",
    title: "Calculadora de Interés Compuesto",
    shortTitle: "Interés Compuesto",
    description:
      "Proyectá el armado de un fondo de emergencia o retiro usando FCI o CEDEARs.",
    icon: TrendingUp,
    category: "Rendimientos",
  },
  {
    id: "billeteras",
    title: "Comparador de Billeteras Virtuales",
    shortTitle: "Billeteras Virtuales",
    description:
      "Ingresá un monto y visualizá cuánto rendiría diariamente en las principales cuentas remuneradas.",
    icon: Smartphone,
    category: "Rendimientos",
  },
  {
    id: "cuotas-cft",
    title: "Simulador de Cuotas con Interés",
    shortTitle: "Cuotas con CFT",
    description:
      "Evaluá si conviene pagar de contado o financiar con tarjeta calculando el CFT real frente a la inflación.",
    icon: CreditCard,
    category: "Préstamos y Deudas",
  },
  {
    id: "conversor-dolar",
    title: "Conversor de Dólar Múltiple",
    shortTitle: "Conversor Dólar",
    description:
      "Consultá y convertí montos entre Pesos, Dólar Oficial, Blue, MEP y CCL al instante.",
    icon: DollarSign,
    category: "Utilidades",
  },
  {
    id: "categorizador",
    title: "Categorizador Inteligente",
    shortTitle: "Categorizador",
    description:
      "Escribí un concepto y el sistema sugiere la categoría correcta basándose en parámetros contables reales.",
    icon: Tag,
    category: "Utilidades",
  },
  {
    id: "alertas-vencimientos",
    title: "Sistema de Alertas de Vencimientos",
    shortTitle: "Alertas de Vencimientos",
    description:
      "Agendá vencimientos de tarjetas y servicios para evitar multas.",
    icon: Bell,
    category: "Utilidades",
    externalLink: "reminders",
  },
  {
    id: "presupuesto-50-30-20",
    title: "Calculadora de Presupuesto 50/30/20",
    shortTitle: "Presupuesto 50/30/20",
    description:
      "Ingresá tu sueldo neto y dividí automáticamente en necesidades, deseos y ahorro.",
    icon: PieChart,
    category: "Presupuesto",
  },
  {
    id: "suscripciones",
    title: "Auditor de Suscripciones",
    shortTitle: "Auditor de Suscripciones",
    description:
      "Cargá tus servicios de streaming y calculá su peso anual en el presupuesto con impuestos vigentes.",
    icon: Repeat,
    category: "Presupuesto",
  },
  {
    id: "fondo-emergencia",
    title: "Calculadora de Fondo de Emergencia",
    shortTitle: "Fondo de Emergencia",
    description:
      "Evaluá tus gastos fijos y determiná el monto exacto para cubrir 3 a 6 meses de contingencias.",
    icon: Shield,
    category: "Presupuesto",
  },
  {
    id: "inflacion-ipc",
    title: "Ajustador por Inflación",
    shortTitle: "Ajustador por Inflación",
    description:
      "Actualizá valores pasados al presente utilizando el Índice de Precios al Consumidor (IPC).",
    icon: Gauge,
    category: "Utilidades",
  },
  {
    id: "prestamos-frances",
    title: "Simulador de Préstamos (Sistema Francés)",
    shortTitle: "Préstamos Francés",
    description:
      "Sabé qué porcentaje de la cuota va a capital y cuánto a intereses en tu crédito.",
    icon: Landmark,
    category: "Préstamos y Deudas",
  },
  {
    id: "bola-nieve",
    title: "Proyector de Cancelación de Deudas",
    shortTitle: "Bola de Nieve",
    description:
      "Organizá tus deudas de menor a mayor y obtené un plan de pagos acelerado para liquidarlas.",
    icon: Snowflake,
    category: "Préstamos y Deudas",
  },
];

export const TOOL_CATEGORIES: Array<ToolDef["category"]> = [
  "Rendimientos",
  "Préstamos y Deudas",
  "Presupuesto",
  "Utilidades",
];

export function getToolById(id: ToolId): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}
