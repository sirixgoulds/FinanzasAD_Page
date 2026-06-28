"use client";

import { useMemo, useState } from "react";
import { FileDown, Landmark } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/finance";
import { generatePdfReport } from "@/lib/pdf-report";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FilaAmortizacion {
  mes: number;
  cuota: number;
  capital: number;
  interes: number;
  saldo: number;
}

export function PrestamosFrancesTool() {
  const [monto, setMonto] = useState(1_000_000);
  const [tasaAnual, setTasaAnual] = useState(75);
  const [cuotas, setCuotas] = useState(24);

  const montoSeguro = Math.max(0, monto || 0);
  const cuotasSeguras = Math.max(1, Math.floor(cuotas || 0));
  const tasaSegura = Math.max(0, tasaAnual || 0);

  const resultado = useMemo(() => {
    const r = tasaSegura / 100 / 12;
    const n = cuotasSeguras;
    let cuota: number;
    if (r === 0) {
      cuota = montoSeguro / n;
    } else {
      const pot = Math.pow(1 + r, n);
      cuota = (montoSeguro * (r * pot)) / (pot - 1);
    }

    const schedule: FilaAmortizacion[] = [];
    let saldo = montoSeguro;
    let totalInteres = 0;
    for (let mes = 1; mes <= n; mes++) {
      const interes = saldo * r;
      const capital = cuota - interes;
      saldo = Math.max(0, saldo - capital);
      totalInteres += interes;
      schedule.push({
        mes,
        cuota,
        capital,
        interes,
        saldo,
      });
    }
    const totalPagar = cuota * n;
    return { cuota, schedule, totalInteres, totalPagar };
  }, [montoSeguro, tasaSegura, cuotasSeguras]);

  const primeras12 = resultado.schedule.slice(0, 12);

  function handleDescargar() {
    if (montoSeguro <= 0) {
      toast.error("Ingresá un monto de préstamo mayor a 0");
      return;
    }
    if (cuotasSeguras <= 0) {
      toast.error("La cantidad de cuotas debe ser mayor a 0");
      return;
    }

    const schedulePdf = resultado.schedule.slice(0, 24);
    const footnote =
      resultado.schedule.length > 24
        ? `Se muestran los primeros 24 meses de un total de ${resultado.schedule.length}.`
        : undefined;

    generatePdfReport({
      title: "Simulador de Préstamos — Sistema Francés",
      subtitle: "Amortización de crédito con cuota fija mensual",
      sections: [
        {
          type: "key-values",
          heading: "Parámetros del Préstamo",
          rows: [
            { label: "Monto del préstamo", value: formatCurrency(montoSeguro) },
            { label: "Tasa anual", value: `${tasaSegura}%` },
            { label: "Tasa mensual", value: `${(tasaSegura / 12).toFixed(4)}%` },
            { label: "Cantidad de cuotas", value: `${cuotasSeguras}` },
          ],
        },
        {
          type: "key-values",
          heading: "Resultados",
          rows: [
            {
              label: "Cuota mensual fija",
              value: formatCurrency(resultado.cuota),
              highlight: true,
            },
            {
              label: "Total a pagar",
              value: formatCurrency(resultado.totalPagar),
              highlight: true,
            },
            {
              label: "Total intereses",
              value: formatCurrency(resultado.totalInteres),
            },
            {
              label: "Costo financiero sobre capital",
              value: `${(resultado.totalInteres / montoSeguro * 100).toFixed(2)}%`,
            },
          ],
        },
        {
          type: "table",
          heading: "Cronograma de Amortización",
          headers: ["Mes", "Cuota", "Capital", "Interés", "Saldo"],
          rows: schedulePdf.map((f) => [
            String(f.mes),
            formatCurrency(f.cuota),
            formatCurrency(f.capital),
            formatCurrency(f.interes),
            formatCurrency(f.saldo),
          ]),
          footnote,
        },
        {
          type: "text",
          heading: "Cómo funciona el Sistema Francés",
          paragraphs: [
            "El sistema francés es el método de amortización más usado en Argentina para préstamos personales, hipotecas y créditos prendarios. Su característica principal es que pagás una cuota fija y constante durante toda la vida del préstamo.",
            "Cada cuota se compone de dos partes: capital (lo que efectivamente devolvés del préstamo) e interés (el costo del dinero). Al principio, la mayor parte de la cuota va a intereses porque el saldo pendiente es alto. A medida que amortizás capital, el saldo baja y los intereses decrecen, por lo que más del pago se destina a capital.",
            "Esto significa que los intereses están 'cargados al frente': en el primer tercio del préstamo ya pagás más de la mitad de los intereses totales. Por eso, adelantar cuotas en los primeros meses tiene un impacto enorme en el costo total, mientras que hacerlo cerca del final apenas cambia el resultado.",
            `En tu simulación, sobre un capital de ${formatCurrency(
              montoSeguro
            )} a ${cuotasSeguras} meses con una tasa anual del ${tasaSegura}%, vas a pagar ${formatCurrency(
              resultado.totalInteres
            )} en intereses (un ${(resultado.totalInteres / montoSeguro * 100).toFixed(
              2
            )}% del capital).`,
          ],
        },
      ],
    });
    toast.success("PDF generado correctamente");
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Landmark className="w-5 h-5 text-blue-600" />
          Simulador de Préstamos — Sistema Francés
        </CardTitle>
        <CardDescription>
          Calculá la cuota fija mensual y el cronograma de amortización de un
          préstamo con tasa y plazo definidos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pf-monto">Monto del préstamo ($)</Label>
              <Input
                id="pf-monto"
                type="number"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-tasa">Tasa anual (%)</Label>
              <Input
                id="pf-tasa"
                type="number"
                value={tasaAnual}
                onChange={(e) => setTasaAnual(Number(e.target.value))}
              />
              <p className="text-xs text-slate-500">
                Tasa mensual equivalente:{" "}
                <span className="font-semibold tabular-nums">
                  {(tasaSegura / 12).toFixed(4)}%
                </span>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-cuotas">Cantidad de cuotas (meses)</Label>
              <Input
                id="pf-cuotas"
                type="number"
                min={1}
                value={cuotas}
                onChange={(e) => setCuotas(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Results */}
          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3 self-start">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-600 font-medium text-sm">
                Cuota mensual fija
              </span>
              <span className="text-2xl font-bold text-blue-700 tabular-nums">
                {formatCurrency(resultado.cuota)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-600 font-medium text-sm">
                Total a pagar ({cuotasSeguras} cuotas)
              </span>
              <span className="text-lg font-semibold text-slate-700 tabular-nums">
                {formatCurrency(resultado.totalPagar)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-600 font-medium text-sm">
                Total intereses
              </span>
              <span className="text-lg font-semibold text-rose-600 tabular-nums">
                {formatCurrency(resultado.totalInteres)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium text-sm">
                Costo financiero
              </span>
              <span className="text-lg font-semibold text-amber-600 tabular-nums">
                {montoSeguro > 0
                  ? `${(
                      (resultado.totalInteres / montoSeguro) *
                      100
                    ).toFixed(2)}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Amortization table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Cronograma de Amortización
            </h3>
            <span className="text-xs text-slate-500">
              Mostrando {primeras12.length} de {resultado.schedule.length}{" "}
              cuotas
            </span>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-slate-50 z-10">
                  <TableRow>
                    <TableHead className="w-16">Mes</TableHead>
                    <TableHead className="text-right">Cuota</TableHead>
                    <TableHead className="text-right">Capital</TableHead>
                    <TableHead className="text-right">Interés</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {primeras12.map((f) => (
                    <TableRow key={f.mes}>
                      <TableCell className="font-medium tabular-nums">
                        {f.mes}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(f.cuota)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-emerald-600">
                        {formatCurrency(f.capital)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-rose-600">
                        {formatCurrency(f.interes)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatCurrency(f.saldo)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={handleDescargar}>
            <FileDown className="w-4 h-4" />
            Descargar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
