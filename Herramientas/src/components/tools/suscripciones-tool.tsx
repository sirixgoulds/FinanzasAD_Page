"use client";

import { useMemo, useState } from "react";
import { FileDown, Plus, Repeat, Trash2 } from "lucide-react";
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

interface Subscription {
  id: string;
  name: string;
  monthlyCost: number;
}

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  { id: "netflix", name: "Netflix", monthlyCost: 12000 },
  { id: "spotify", name: "Spotify", monthlyCost: 8000 },
  { id: "youtube", name: "YouTube Premium", monthlyCost: 6000 },
  { id: "amazon", name: "Amazon Prime", monthlyCost: 5000 },
];

const IMPUESTOS_FACTOR = 1.29; // PAIS 8% + IVA 21%

function generateId(): string {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function SuscripcionesTool() {
  const [subs, setSubs] = useState<Subscription[]>(DEFAULT_SUBSCRIPTIONS);
  const [salary, setSalary] = useState<number>(1500000);
  const [newName, setNewName] = useState<string>("");
  const [newCost, setNewCost] = useState<number>(0);

  const totals = useMemo(() => {
    const monthly = subs.reduce(
      (acc, s) => acc + (Number.isFinite(s.monthlyCost) ? s.monthlyCost : 0),
      0
    );
    const annual = monthly * 12;
    const monthlyWithTax = monthly * IMPUESTOS_FACTOR;
    const annualWithTax = annual * IMPUESTOS_FACTOR;
    const salaryNum = Number.isFinite(salary) && salary > 0 ? salary : 0;
    const percentOfSalary =
      salaryNum > 0 ? (monthlyWithTax / salaryNum) * 100 : 0;
    return {
      monthly,
      annual,
      monthlyWithTax,
      annualWithTax,
      percentOfSalary,
    };
  }, [subs, salary]);

  function handleAdd() {
    const name = newName.trim();
    if (!name) {
      toast.error("Ingresá el nombre del servicio.");
      return;
    }
    if (!Number.isFinite(newCost) || newCost <= 0) {
      toast.error("Ingresá un costo mensual válido.");
      return;
    }
    setSubs((prev) => [
      ...prev,
      { id: generateId(), name, monthlyCost: newCost },
    ]);
    setNewName("");
    setNewCost(0);
    toast.success(`"${name}" agregado a la lista.`);
  }

  function handleRemove(id: string) {
    setSubs((prev) => prev.filter((s) => s.id !== id));
  }

  function handleUpdateCost(id: string, value: number) {
    setSubs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, monthlyCost: value } : s))
    );
  }

  function handleUpdateName(id: string, value: string) {
    setSubs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: value } : s))
    );
  }

  function handleDownloadPdf() {
    if (subs.length === 0) {
      toast.error("Agregá al menos una suscripción para generar el reporte.");
      return;
    }

    generatePdfReport({
      title: "Auditor de Suscripciones",
      subtitle: "Análisis de costo mensual y anual con impuestos argentinos",
      sections: [
        {
          type: "table",
          heading: "Detalle de suscripciones",
          headers: ["Servicio", "Costo Mensual", "Costo Anual"],
          rows: subs.map((s) => [
            s.name,
            formatCurrency(s.monthlyCost),
            formatCurrency(s.monthlyCost * 12),
          ]),
          footnote: `Total de servicios: ${subs.length}.`,
        },
        {
          type: "key-values",
          heading: "Totales",
          rows: [
            {
              label: "Total mensual (sin impuestos)",
              value: formatCurrency(totals.monthly),
            },
            {
              label: "Total anual (sin impuestos)",
              value: formatCurrency(totals.annual),
            },
            {
              label: "Total mensual con impuestos (PAIS 8% + IVA 21%)",
              value: formatCurrency(totals.monthlyWithTax),
              highlight: true,
            },
            {
              label: "Total anual con impuestos",
              value: formatCurrency(totals.annualWithTax),
              highlight: true,
            },
            {
              label: `% del sueldo (${formatCurrency(salary)})`,
              value: `${totals.percentOfSalary.toFixed(2)}%`,
              highlight: true,
            },
          ],
        },
        {
          type: "text",
          heading: "Recomendaciones",
          paragraphs: [
            "Revisá tus suscripciones al menos una vez al trimestre. Muchas plataformas ofrecen planes con anuncios o versiones grupales (familia) que reducen el costo por persona.",
            `Si tus suscripciones representan más del 5% de tu sueldo (${formatCurrency(
              salary
            )}), considerá cancelar las que menos usás. El ahorro anual de cancelar una sola suscripción de ${formatCurrency(
              10000
            )} es de ${formatCurrency(10000 * 12 * IMPUESTOS_FACTOR)} con impuestos.`,
            "En Argentina, a los servicios digitales del exterior se les aplica el Impuesto PAIS (8%) y percepciones de IVA (21%), totalizando un 29% adicional sobre el precio en pesos. Tenedlo en cuenta al evaluar el costo real.",
            "Sugerencia: alterná suscripciones de streaming en lugar de tener todas activas. Por ejemplo, Netflix un trimestre, Disney+ el siguiente.",
          ],
        },
      ],
    });

    toast.success("PDF generado correctamente.");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Columna izquierda: lista + agregar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-blue-600" />
            Tus suscripciones
          </CardTitle>
          <CardDescription>
            Cargá todos los servicios de streaming y suscripciones digitales que
            pagás cada mes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {subs.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-6">
                Todavía no cargaste suscripciones.
              </div>
            )}
            {subs.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 p-2"
              >
                <Input
                  value={s.name}
                  onChange={(e) => handleUpdateName(s.id, e.target.value)}
                  className="flex-1 h-8"
                  aria-label={`Nombre de ${s.name}`}
                />
                <Input
                  type="number"
                  min={0}
                  value={s.monthlyCost === 0 ? "" : s.monthlyCost}
                  onChange={(e) =>
                    handleUpdateCost(
                      s.id,
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  className="w-28 h-8 tabular-nums"
                  aria-label={`Costo mensual de ${s.name}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => handleRemove(s.id)}
                  aria-label={`Eliminar ${s.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 p-3 space-y-2">
            <Label className="text-xs text-slate-500 uppercase tracking-wide">
              Agregar nuevo servicio
            </Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nombre del servicio"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 h-8"
              />
              <Input
                type="number"
                min={0}
                placeholder="Costo"
                value={newCost === 0 ? "" : newCost}
                onChange={(e) =>
                  setNewCost(
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                className="w-28 h-8 tabular-nums"
              />
              <Button
                size="sm"
                onClick={handleAdd}
                className="h-8"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Columna derecha: resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de gastos</CardTitle>
          <CardDescription>
            Cálculo con impuestos argentinos vigentes (PAIS 8% + IVA 21%).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salary">Sueldo mensual de referencia (ARS)</Label>
            <Input
              id="salary"
              type="number"
              min={0}
              value={salary === 0 ? "" : salary}
              onChange={(e) =>
                setSalary(e.target.value === "" ? 0 : Number(e.target.value))
              }
              className="tabular-nums"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Total mensual
              </div>
              <div className="text-xl font-bold text-slate-800 tabular-nums">
                {formatCurrency(totals.monthly)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">sin impuestos</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Total anual
              </div>
              <div className="text-xl font-bold text-slate-800 tabular-nums">
                {formatCurrency(totals.annual)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">sin impuestos</div>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-blue-600">
                  Con impuestos (×1.29)
                </div>
                <div className="text-xs text-slate-600">PAIS 8% + IVA 21%</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-700 tabular-nums">
                  {formatCurrency(totals.monthlyWithTax)}
                </div>
                <div className="text-xs text-slate-500 tabular-nums">
                  anual: {formatCurrency(totals.annualWithTax)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <div className="text-xs uppercase tracking-wide text-amber-700 mb-1">
              Impacto en tu sueldo
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-700 tabular-nums">
                {totals.percentOfSalary.toFixed(2)}%
              </span>
              <span className="text-xs text-slate-600">
                de {formatCurrency(salary)}
              </span>
            </div>
            {totals.percentOfSalary > 5 && (
              <p className="text-xs text-rose-600 mt-1">
                Más del 5% recomendado: considerá cancelar alguna.
              </p>
            )}
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
    </div>
  );
}
