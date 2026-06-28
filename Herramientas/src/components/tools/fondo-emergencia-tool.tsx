"use client";

import { useMemo, useState } from "react";
import { FileDown, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/finance";
import { generatePdfReport } from "@/lib/pdf-report";

interface ExpenseField {
  key: string;
  label: string;
  placeholder: string;
}

const EXPENSE_FIELDS: ExpenseField[] = [
  { key: "alquiler", label: "Alquiler / Cuota", placeholder: "Ej: 350000" },
  { key: "servicios", label: "Servicios (luz, gas, internet)", placeholder: "Ej: 45000" },
  { key: "comida", label: "Comida / Supermercado", placeholder: "Ej: 180000" },
  { key: "transporte", label: "Transporte / Nafta", placeholder: "Ej: 60000" },
  { key: "seguros", label: "Seguros / Prepaga", placeholder: "Ej: 80000" },
  { key: "otros", label: "Otros gastos fijos", placeholder: "Ej: 30000" },
];

const MONTHS_OPTIONS = [3, 4, 5, 6];

export function FondoEmergenciaTool() {
  const [expenses, setExpenses] = useState<Record<string, number>>({
    alquiler: 0,
    servicios: 0,
    comida: 0,
    transporte: 0,
    seguros: 0,
    otros: 0,
  });
  const [months, setMonths] = useState<number>(3);

  const totalMonthly = useMemo(() => {
    return Object.values(expenses).reduce(
      (acc, v) => acc + (Number.isFinite(v) && v > 0 ? v : 0),
      0
    );
  }, [expenses]);

  const fondo3 = useMemo(() => totalMonthly * 3, [totalMonthly]);
  const fondo6 = useMemo(() => totalMonthly * 6, [totalMonthly]);
  const fondoSelected = useMemo(() => totalMonthly * months, [totalMonthly, months]);

  function handleExpenseChange(key: string, value: number) {
    setExpenses((prev) => ({ ...prev, [key]: value }));
  }

  function handleDownloadPdf() {
    if (totalMonthly <= 0) {
      toast.error("Cargá al menos un gasto fijo para generar el reporte.");
      return;
    }

    generatePdfReport({
      title: "Calculadora de Fondo de Emergencia",
      subtitle: "Cobertura de gastos fijos ante contingencias",
      sections: [
        {
          type: "key-values",
          heading: "Gastos fijos mensuales",
          rows: EXPENSE_FIELDS.map((f) => ({
            label: f.label,
            value: formatCurrency(expenses[f.key] ?? 0),
          })),
        },
        {
          type: "key-values",
          heading: "Resultados",
          rows: [
            {
              label: "Total gastos fijos mensuales",
              value: formatCurrency(totalMonthly),
            },
            {
              label: "Fondo para 3 meses (mínimo)",
              value: formatCurrency(fondo3),
            },
            {
              label: "Fondo para 6 meses (recomendado)",
              value: formatCurrency(fondo6),
            },
            {
              label: `Fondo recomendado (${months} meses)`,
              value: formatCurrency(fondoSelected),
              highlight: true,
            },
          ],
        },
        {
          type: "text",
          heading: "Importancia y dónde mantenerlo",
          paragraphs: [
            "El fondo de emergencia es un colchón de dinero líquido destinado a cubrir gastos imprevistos: pérdida de empleo, urgencias médicas, reparaciones del hogar o del auto, o una contingencia familiar. No es una inversión: es un seguro.",
            "La regla general indica cubrir entre 3 y 6 meses de gastos fijos esenciales (no ingresos). Para trabajadores en relación de dependencia con doble ingreso en el hogar, 3 meses suele ser suficiente; para autónomos o ingresos irregulares, apuntá a 6 meses.",
            "Dónde guardarlo: debe estar disponible de inmediato o en 24-48 hs, pero al mismo tiempo protegerse de la inflación. Opciones recomendadas en Argentina:",
            "1. Cuenta remunerada (Mercado Pago, Personal Pay, Naranja X): liquidez inmediata, rinde TNA aprox. del 30-40% anual. Ideal para el 30-50% del fondo.",
            "2. Fondos Comunes de Inversión (FCI) money market (Mercado Fondos, Balanz, IOL): liquidez en 24 hs, rendimiento similar al plazo fijo pero sin bloqueo. Para el 40-60% restante.",
            "3. Plazo fijo tradicional o UVA: solo para el monto que no necesitarías en menos de 30 días. El plazo fijo UVA preserves poder adquisitivo contra la inflación.",
            "Evitá: tenerlo en efectivo bajo el colchón (pierde contra la inflación) ni invertirlo en instrumentos volátiles (acciones, cripto) donde podrías necesitarlo en momento de baja.",
          ],
        },
      ],
    });

    toast.success("PDF generado correctamente.");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Columna izquierda: inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Gastos fijos mensuales
          </CardTitle>
          <CardDescription>
            Cargá los gastos esenciales que tendrías que cubrir si perdés tus
            ingresos durante una contingencia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXPENSE_FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key} className="text-xs text-slate-600">
                  {f.label}
                </Label>
                <Input
                  id={f.key}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder={f.placeholder}
                  value={expenses[f.key] === 0 ? "" : expenses[f.key]}
                  onChange={(e) =>
                    handleExpenseChange(
                      f.key,
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  className="tabular-nums"
                />
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Total gastos fijos mensuales
            </div>
            <div className="text-2xl font-bold text-slate-800 tabular-nums">
              {formatCurrency(totalMonthly)}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-600 uppercase tracking-wide">
              Meses de cobertura
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {MONTHS_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`py-2 rounded-lg text-sm font-semibold transition-colors tabular-nums ${
                    months === m
                      ? "bg-blue-600 text-white border border-blue-600"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {m} meses
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            className="w-full sm:w-auto"
          >
            <FileDown className="w-4 h-4" />
            Descargar PDF
          </Button>
        </CardContent>
      </Card>

      {/* Columna derecha: resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Fondo recomendado</CardTitle>
          <CardDescription>
            Cuánto necesitás ahorrar para cubrir tus gastos durante una
            contingencia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
            <div className="text-xs uppercase tracking-wide text-blue-700 mb-1">
              Fondo recomendado ({months} meses)
            </div>
            <div className="text-3xl font-bold text-blue-700 tabular-nums">
              {formatCurrency(fondoSelected)}
            </div>
            <div className="text-xs text-slate-600 mt-1 tabular-nums">
              = {formatCurrency(totalMonthly)} × {months}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Mínimo (3 meses)
              </div>
              <div className="text-xl font-bold text-slate-800 tabular-nums">
                {formatCurrency(fondo3)}
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <div className="text-xs uppercase tracking-wide text-emerald-700">
                Recomendado (6 meses)
              </div>
              <div className="text-xl font-bold text-emerald-700 tabular-nums">
                {formatCurrency(fondo6)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dónde guardarlo
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>
                  <span className="font-medium">Cuenta remunerada</span> (Mercado
                  Pago, Personal Pay): liquidez inmediata.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>
                  <span className="font-medium">FCI money market</span>: rinde
                  similar al PF sin bloqueo, retiro en 24 hs.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>
                  <span className="font-medium">Plazo fijo UVA</span>: protege
                  contra inflación, solo para el monto no urgente.
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
