"use client";

import { useMemo, useState } from "react";
import { FileDown, PieChart } from "lucide-react";
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

interface Reparto {
  label: string;
  porcentaje: number;
  monto: number;
  descripcion: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export function PresupuestoTool() {
  const [sueldo, setSueldo] = useState<number>(0);

  const sueldoNum = useMemo(() => {
    const n = Number(sueldo);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [sueldo]);

  const reparto = useMemo<Reparto[]>(() => {
    return [
      {
        label: "Necesidades",
        porcentaje: 50,
        monto: sueldoNum * 0.5,
        descripcion: "Alquiler, servicios, comida, transporte, salud.",
        color: "bg-emerald-500",
        bgColor: "bg-emerald-50 border-emerald-200",
        textColor: "text-emerald-700",
      },
      {
        label: "Deseos",
        porcentaje: 30,
        monto: sueldoNum * 0.3,
        descripcion: "Ocio, salidas, suscripciones, ropa, restaurantes.",
        color: "bg-amber-500",
        bgColor: "bg-amber-50 border-amber-200",
        textColor: "text-amber-700",
      },
      {
        label: "Ahorro / Inversión",
        porcentaje: 20,
        monto: sueldoNum * 0.2,
        descripcion: "Fondo de emergencia, plazos fijos, FCI, CEDEARs.",
        color: "bg-blue-600",
        bgColor: "bg-blue-50 border-blue-200",
        textColor: "text-blue-700",
      },
    ];
  }, [sueldoNum]);

  function handleDownloadPdf() {
    if (sueldoNum <= 0) {
      toast.error("Ingresá un sueldo neto válido para generar el reporte.");
      return;
    }

    generatePdfReport({
      title: "Calculadora de Presupuesto 50/30/20",
      subtitle: "Distribución ideal de tus ingresos",
      sections: [
        {
          type: "key-values",
          heading: "Parámetros",
          rows: [
            {
              label: "Sueldo neto mensual",
              value: formatCurrency(sueldoNum),
            },
          ],
        },
        {
          type: "key-values",
          heading: "Resultados",
          rows: reparto.map((r) => ({
            label: `${r.label} (${r.porcentaje}%)`,
            value: formatCurrency(r.monto),
            highlight: true,
          })),
        },
        {
          type: "text",
          heading: "Metodología",
          paragraphs: [
            "La regla 50/30/20 es un método de presupuesto popularizado por la senadora Elizabeth Warren en su libro 'All Your Worth: The Ultimate Lifetime Money Plan'. Sugiere dividir los ingresos netos en tres grandes categorías.",
            "Necesidades (50%): incluye todos los gastos imprescindibles para vivir — alquiler o hipoteca, servicios públicos (luz, gas, agua, internet), comida básica, transporte al trabajo, seguros obligatorios, salud y educación. Si estos gastos superan el 50%, hay que revisar costos fijos.",
            "Deseos (30%): cubre todo lo que no es esencial pero mejora la calidad de vida — salidas a comer, cine, viajes, ropa no esencial, suscripciones de streaming, hobbies. Es la categoría más fácil de ajustar cuando hay que ahorrar más.",
            "Ahorro / Inversión (20%): destinar al menos el 20% a construir un fondo de emergencia, pagar deudas, invertir en plazos fijos, Fondos Comunes de Inversión (FCI), CEDEARs o aportar a un jubilación complementaria. En Argentina, priorizar instrumentos atados al dólar (dólar MEP, CEDEARs) o inflation-linked.",
          ],
        },
      ],
    });

    toast.success("PDF generado correctamente.");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Columna izquierda: input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Tu ingreso mensual
          </CardTitle>
          <CardDescription>
            Ingresá tu sueldo neto (después de impuestos y aportes) y te
            mostramos cómo dividirlo según la regla 50/30/20.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sueldo">Sueldo neto mensual (ARS)</Label>
            <Input
              id="sueldo"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Ej: 1500000"
              value={sueldo === 0 ? "" : sueldo}
              onChange={(e) =>
                setSueldo(e.target.value === "" ? 0 : Number(e.target.value))
              }
              className="text-base tabular-nums"
            />
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
              Ingreso total
            </div>
            <div className="text-2xl font-bold text-slate-800 tabular-nums">
              {formatCurrency(sueldoNum)}
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
          <CardTitle>Distribución 50/30/20</CardTitle>
          <CardDescription>
            Visualizá cómo se reparte tu ingreso en cada categoría.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra combinada */}
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
            {reparto.map((r) => (
              <div
                key={r.label}
                className={r.color}
                style={{ width: `${r.porcentaje}%` }}
                title={`${r.label} ${r.porcentaje}%`}
              />
            ))}
          </div>

          <div className="space-y-3">
            {reparto.map((r) => (
              <div
                key={r.label}
                className={`rounded-xl border p-4 ${r.bgColor}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${r.color}`}
                    />
                    <span className="font-semibold text-slate-800">
                      {r.label}
                    </span>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {r.porcentaje}%
                    </span>
                  </div>
                  <div
                    className={`text-lg font-bold tabular-nums ${r.textColor}`}
                  >
                    {formatCurrency(r.monto)}
                  </div>
                </div>
                <p className="text-xs text-slate-600">{r.descripcion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
