"use client";

import { useMemo, useState } from "react";
import { FileDown, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { generatePdfReport } from "@/lib/pdf-report";
import { formatCurrency } from "@/lib/finance";
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

/**
 * Simulador de Cuotas con Interés y CFT.
 * Compara pagar de contado vs financiar en cuotas, descontando la inflación
 * esperada para calcular el valor presente de las cuotas.
 */
export function CuotasCftTool() {
  const [contado, setContado] = useState<number>(200000);
  const [cuotas, setCuotas] = useState<number>(12);
  const [interesMensual, setInteresMensual] = useState<number>(5);
  const [inflacion, setInflacion] = useState<number>(4);

  const calc = useMemo(() => {
    const safeContado =
      Number.isFinite(contado) && contado > 0 ? contado : 0;
    const safeCuotas =
      Number.isFinite(cuotas) && cuotas > 0 ? Math.floor(cuotas) : 1;
    const safeInteres =
      Number.isFinite(interesMensual) && interesMensual >= 0
        ? interesMensual
        : 0;
    const safeInflacion =
      Number.isFinite(inflacion) && inflacion >= 0 ? inflacion : 0;

    const tasaInteres = safeInteres / 100;
    const tasaInflacion = safeInflacion / 100;

    // Total financiado: capital más interés compuesto mensual sobre el monto
    const totalFinanciado = safeContado * Math.pow(1 + tasaInteres, safeCuotas);
    const cuotaPromedio = totalFinanciado / safeCuotas;
    const cft = safeContado > 0 ? (totalFinanciado / safeContado - 1) * 100 : 0;

    // Detalle mes a mes descontando inflación
    const detalle = Array.from({ length: safeCuotas }, (_, i) => {
      const mes = i + 1;
      const factor = Math.pow(1 + tasaInflacion, mes);
      const valorPresente = cuotaPromedio / factor;
      return {
        mes,
        cuota: cuotaPromedio,
        factorDescuento: 1 / factor,
        valorPresente,
      };
    });

    const valorPresenteTotal = detalle.reduce(
      (acc, d) => acc + d.valorPresente,
      0
    );

    const convieneFinanciar = valorPresenteTotal < safeContado;

    return {
      contado: safeContado,
      cuotas: safeCuotas,
      interesMensual: safeInteres,
      inflacion: safeInflacion,
      totalFinanciado,
      cuotaPromedio,
      cft,
      detalle,
      valorPresenteTotal,
      convieneFinanciar,
    };
  }, [contado, cuotas, interesMensual, inflacion]);

  function handleDownloadPdf() {
    if (calc.contado <= 0) {
      toast.error("Ingresá un monto contado mayor a 0");
      return;
    }
    if (calc.cuotas <= 0) {
      toast.error("Ingresá una cantidad de cuotas válida");
      return;
    }

    const conclusion = calc.convieneFinanciar
      ? "Conviene financiar en cuotas"
      : "Conviene pagar de contado";

    generatePdfReport({
      title: "Simulador de Cuotas con Interés",
      subtitle: `Comparación contado vs ${calc.cuotas} cuotas con inflación`,
      sections: [
        {
          type: "key-values",
          heading: "Parámetros",
          rows: [
            { label: "Monto de contado", value: formatCurrency(calc.contado) },
            { label: "Cantidad de cuotas", value: String(calc.cuotas) },
            {
              label: "Interés mensual",
              value: `${calc.interesMensual.toFixed(2)}%`,
            },
            {
              label: "Inflación mensual esperada",
              value: `${calc.inflacion.toFixed(2)}%`,
            },
          ],
        },
        {
          type: "key-values",
          heading: "Resultados",
          rows: [
            {
              label: "Monto total financiado",
              value: formatCurrency(calc.totalFinanciado),
            },
            {
              label: "Cuota promedio",
              value: formatCurrency(calc.cuotaPromedio),
            },
            { label: "CFT (Costo Financiero Total)", value: `${calc.cft.toFixed(2)}%` },
            {
              label: "Valor presente de las cuotas",
              value: formatCurrency(calc.valorPresenteTotal),
              highlight: true,
            },
          ],
        },
        {
          type: "text",
          heading: "Conclusión",
          paragraphs: [
            `${conclusion}. Pagando de contado gastás ${formatCurrency(calc.contado)}, mientras que el valor presente de las ${calc.cuotas} cuotas (descontando una inflación mensual esperada del ${calc.inflacion.toFixed(2)}%) es ${formatCurrency(calc.valorPresenteTotal)}.`,
            calc.convieneFinanciar
              ? "Como el valor presente de las cuotas es menor al precio de contado, financiar te conviene: la inflación licúa el valor real de las cuotas futuras y el costo financiero queda más que compensado."
              : "Como el valor presente de las cuotas supera al precio de contado, pagar de contado es la mejor opción: el interés mensual aplicado supera a la inflación esperada, encareciendo la compra.",
            "El CFT (Costo Financiero Total) indica cuánto más pagás por financiar la compra respecto del precio de contado, sin descontar inflación. Cuando la inflación esperada supera al interés mensual, el valor presente de las cuotas cae y financiar se vuelve atractivo.",
            "Tip: si el comercio ofrece cuotas sin interés (0% interés mensual), casi siempre conviene financiar y dejar el dinero de contado invertido en una billetera virtual o plazo fijo, generando rendimiento mientras la inflación licúa la deuda.",
          ],
        },
        {
          type: "table",
          heading: "Detalle mes por mes",
          headers: ["Mes", "Cuota", "Factor de descuento", "Valor presente"],
          rows: calc.detalle.map((d) => [
            String(d.mes),
            formatCurrency(d.cuota),
            d.factorDescuento.toFixed(4),
            formatCurrency(d.valorPresente),
          ]),
        },
      ],
    });
    toast.success("PDF generado correctamente");
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-blue-500" />
          Simulador de Cuotas con Interés (CFT)
        </CardTitle>
        <CardDescription>
          Compará pagar de contado vs financiar en cuotas, descontando la
          inflación esperada para conocer el valor presente real.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contado">Monto de contado ($)</Label>
              <Input
                id="contado"
                type="number"
                min={0}
                step="1000"
                value={Number.isNaN(contado) ? "" : contado}
                onChange={(e) => setContado(Number(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cuotas">Cantidad de cuotas</Label>
                <Input
                  id="cuotas"
                  type="number"
                  min={1}
                  step="1"
                  value={Number.isNaN(cuotas) ? "" : cuotas}
                  onChange={(e) => setCuotas(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interes">Interés mensual (%)</Label>
                <Input
                  id="interes"
                  type="number"
                  min={0}
                  step="0.01"
                  value={Number.isNaN(interesMensual) ? "" : interesMensual}
                  onChange={(e) => setInteresMensual(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inflacion">Inflación mensual esperada (%)</Label>
              <Input
                id="inflacion"
                type="number"
                min={0}
                step="0.01"
                value={Number.isNaN(inflacion) ? "" : inflacion}
                onChange={(e) => setInflacion(Number(e.target.value))}
              />
              <p className="text-xs text-slate-500">
                Si la inflación supera al interés, financiar suele convenir.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadPdf}
            >
              <FileDown className="w-4 h-4" />
              Descargar PDF
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3">
              <h4 className="text-sm font-semibold text-slate-700">
                Resumen financiero
              </h4>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600 text-sm">Cuota promedio</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatCurrency(calc.cuotaPromedio)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600 text-sm">
                  Total financiado
                </span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatCurrency(calc.totalFinanciado)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600 text-sm">CFT</span>
                <span className="font-semibold text-rose-600 tabular-nums">
                  {calc.cft.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">
                  Valor presente cuotas
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatCurrency(calc.valorPresenteTotal)}
                </span>
              </div>
            </div>

            <div
              className={`p-5 rounded-lg border ${
                calc.convieneFinanciar
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <h4 className="text-sm font-semibold mb-3 text-slate-700">
                Comparación
              </h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-xs text-slate-500 mb-1">De contado</p>
                  <p className="text-lg font-bold text-slate-800 tabular-nums">
                    {formatCurrency(calc.contado)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Financiado (VP)
                  </p>
                  <p
                    className={`text-lg font-bold tabular-nums ${
                      calc.convieneFinanciar
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {formatCurrency(calc.valorPresenteTotal)}
                  </p>
                </div>
              </div>
              <p
                className={`text-center mt-4 text-sm font-semibold ${
                  calc.convieneFinanciar
                    ? "text-emerald-800"
                    : "text-amber-800"
                }`}
              >
                {calc.convieneFinanciar
                  ? "Conviene financiar en cuotas"
                  : "Conviene pagar de contado"}
              </p>
            </div>
          </div>
        </div>

        {/* Month-by-month preview */}
        {calc.detalle.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Detalle mes por mes
            </h4>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Mes</th>
                      <th className="text-right p-2 font-medium">Cuota</th>
                      <th className="text-right p-2 font-medium">
                        Factor descuento
                      </th>
                      <th className="text-right p-2 font-medium">
                        Valor presente
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.detalle.map((d) => (
                      <tr
                        key={d.mes}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-2 text-slate-700 tabular-nums">
                          {d.mes}
                        </td>
                        <td className="p-2 text-right text-slate-700 tabular-nums">
                          {formatCurrency(d.cuota)}
                        </td>
                        <td className="p-2 text-right text-slate-500 tabular-nums">
                          {d.factorDescuento.toFixed(4)}
                        </td>
                        <td className="p-2 text-right font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(d.valorPresente)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
