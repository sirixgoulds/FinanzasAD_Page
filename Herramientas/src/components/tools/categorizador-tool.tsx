"use client";

import { useMemo, useState } from "react";
import { FileDown, Sparkles, Tag } from "lucide-react";
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
import {
  autoCategorizeExpense,
  formatCurrency,
  type ExpenseCategory,
} from "@/lib/finance";
import { generatePdfReport } from "@/lib/pdf-report";

interface CategoryInfo {
  name: ExpenseCategory;
  description: string;
  examples: string;
  color: string;
  dot: string;
}

const CATEGORIES: CategoryInfo[] = [
  {
    name: "Hormiga",
    description: "Gastos chicos y diarios que se escapan del control.",
    examples: "Café, kiosco, golosinas, propinas, snacks, peajes.",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-400",
  },
  {
    name: "Fijo",
    description: "Gastos recurrentes y obligatorios, mismo monto cada mes.",
    examples: "Alquiler, expensas, internet, luz, gas, seguros, prepaga, streaming.",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  {
    name: "Variable Esencial",
    description: "Gastos necesarios pero con monto variable.",
    examples: "Supermercado, farmacia, nafta, transporte, medicamentos.",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-400",
  },
  {
    name: "Variable Prescindible",
    description: "Gastos opcionales, ocio y salidas que podrías reducir.",
    examples: "Restaurantes, cine, ropa, delivery, recitales, viajes.",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-400",
  },
  {
    name: "Otro Gasto",
    description: "Cuando no encaja en ninguna categoría anterior.",
    examples: "Gastos puntuales o atípicos sin patrón claro.",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-300",
  },
];

const EXAMPLE_CHIPS = [
  "Café",
  "Alquiler",
  "Supermercado Coto",
  "Netflix",
  "Nafta",
  "Cena restaurante",
];

export function CategorizadorTool() {
  const [concepto, setConcepto] = useState("");

  const sugerencia = useMemo<ExpenseCategory | null>(() => {
    if (!concepto.trim()) return null;
    return autoCategorizeExpense(concepto.trim());
  }, [concepto]);

  const sugerenciaInfo = useMemo(() => {
    if (!sugerencia) return null;
    return CATEGORIES.find((c) => c.name === sugerencia) ?? null;
  }, [sugerencia]);

  function handleDownloadPdf() {
    if (!concepto.trim()) {
      toast.error("Ingresá un concepto para generar el reporte.");
      return;
    }

    generatePdfReport({
      title: "Categorizador Inteligente",
      subtitle: "Sugerencia automática de categoría de gasto",
      sections: [
        {
          type: "key-values",
          heading: "Concepto analizado",
          rows: [
            { label: "Concepto ingresado", value: concepto.trim() },
            {
              label: "Categoría sugerida",
              value: sugerencia ?? "Otro Gasto",
              highlight: true,
            },
          ],
        },
        {
          type: "text",
          heading: "Explicación de categorías",
          paragraphs: CATEGORIES.map(
            (c) =>
              `${c.name}: ${c.description} Ejemplos: ${c.examples}`
          ),
        },
        {
          type: "key-values",
          heading: "Todas las categorías y sus reglas",
          rows: CATEGORIES.map((c) => ({
            label: c.name,
            value: c.examples,
          })),
        },
      ],
    });

    toast.success("PDF generado correctamente.");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Columna izquierda: input + ejemplos + resultado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Ingresá un concepto
          </CardTitle>
          <CardDescription>
            Escribí cómo registrarías el gasto y te decimos a qué categoría
            corresponde según reglas contables argentinas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="concepto">Concepto del gasto</Label>
            <Input
              id="concepto"
              placeholder="Ej: café starbucks, alquiler, netflix..."
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-500">
              Probá con estos ejemplos:
            </Label>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setConcepto(chip)}
                  className="px-3 py-1.5 text-xs rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {sugerenciaInfo && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide">
                <Tag className="w-3.5 h-3.5" />
                Categoría sugerida
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${sugerenciaInfo.color}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${sugerenciaInfo.dot}`}
                  />
                  {sugerenciaInfo.name}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                {sugerenciaInfo.description}
              </p>
            </div>
          )}

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

      {/* Columna derecha: todas las categorías */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las categorías</CardTitle>
          <CardDescription>
            Referencia educativa de las reglas de categorización. La categoría
            sugerida se resalta en la lista.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
            {CATEGORIES.map((cat) => {
              const isMatch = sugerencia === cat.name;
              return (
                <div
                  key={cat.name}
                  className={`rounded-xl border p-4 transition-all ${
                    isMatch
                      ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${cat.dot}`}
                      />
                      <span className="font-semibold text-slate-800">
                        {cat.name}
                      </span>
                    </div>
                    {isMatch && (
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                        Seleccionada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{cat.description}</p>
                  <p className="text-xs text-slate-500 mt-1 tabular-nums">
                    <span className="font-medium">Ejemplos:</span> {cat.examples}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Re-export para uso opcional en otros módulos
export { formatCurrency };
