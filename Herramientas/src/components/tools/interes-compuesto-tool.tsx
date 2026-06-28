"use client";

import { useMemo, useState } from "react";
import { FileDown, TrendingUp } from "lucide-react";
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
 * Calculadora de Interés Compuesto.
 * Proyecta el crecimiento de un capital inicial con aportes mensuales a una
 * TNA dada, usando la fórmula de valor futuro con anualidades ordinarias.
 */
export function InteresCompuestoTool() {
  const [capital, setCapital] = useState<number>(100000);
  const [aporte, setAporte] = useState<number>(20000);
  const [tna, setTna] = useState<number>(45);
  const [anios, setAnios] = useState<number>(5);

  const calc = useMemo(() => {
    const safeCapital = Number.isFinite(capital) && capital > 0 ? capital : 0;
    const safeAporte = Number.isFinite(aporte) && aporte >= 0 ? aporte : 0;
    const safeTna = Number.isFinite(tna) && tna >= 0 ? tna : 0;
    const safeAnios =
      Number.isFinite(anios) && anios > 0 ? Math.floor(anios) : 1;

    const r = safeTna / 100 / 12;
    const n = safeAnios * 12;

    const fvPrincipal = safeCapital * Math.pow(1 + r, n);
    const fvAportes =
      r > 0 ? safeAporte * ((Math.pow(1 + r, n) - 1) / r) : safeAporte * n;
    const montoFinal = fvPrincipal + fvAportes;
    const capitalInvertido = safeCapital + safeAporte * n;
    const interesesGanados = montoFinal - capitalInvertido;

    // Desglose año por año
    const yearly = Array.from({ length: safeAnios }, (_, idx) => {
      const year = idx + 1;
      const months = year * 12;
      const fvP = safeCapital * Math.pow(1 + r, months);
      const fvA =
        r > 0
          ? safeAporte * ((Math.pow(1 + r, months) - 1) / r)
          : safeAporte * months;
      const total = fvP + fvA;
      const invertido = safeCapital + safeAporte * months;
      const intereses = total - invertido;
      return {
        year,
        invertido,
        intereses,
        total,
      };
    });

    return {
      capital: safeCapital,
      aporte: safeAporte,
      tna: safeTna,
      anios: safeAnios,
      montoFinal,
      capitalInvertido,
      interesesGanados,
      yearly,
    };
  }, [capital, aporte, tna, anios]);

  function handleDownloadPdf() {
    if (calc.capital <= 0) {
      toast.error("Ingresá un capital inicial mayor a 0");
      return;
    }
    if (calc.anios <= 0) {
      toast.error("Ingresá una cantidad de años válida");
      return;
    }

    generatePdfReport({
      title: "Calculadora de Interés Compuesto",
      subtitle: `Proyección a ${calc.anios} años con aportes mensuales`,
      sections: [
        {
          type: "key-values",
          heading: "Parámetros",
          rows: [
            { label: "Capital inicial", value: formatCurrency(calc.capital) },
            { label: "Aporte mensual", value: formatCurrency(calc.aporte) },
            { label: "Tasa Nominal Anual (TNA)", value: `${calc.tna.toFixed(2)}%` },
            { label: "Plazo de inversión", value: `${calc.anios} años` },
          ],
        },
        {
          type: "key-values",
          heading: "Resultados",
          rows: [
            {
              label: "Total invertido",
              value: formatCurrency(calc.capitalInvertido),
            },
            {
              label: "Intereses ganados",
              value: `+${formatCurrency(calc.interesesGanados)}`,
              highlight: true,
            },
            {
              label: "Monto final",
              value: formatCurrency(calc.montoFinal),
              highlight: true,
            },
          ],
        },
        {
          type: "text",
          heading: "Conclusiones",
          paragraphs: [
            `Aportando ${formatCurrency(calc.aporte)} por mes durante ${calc.anios} años a una TNA del ${calc.tna.toFixed(2)}%, tu capital inicial de ${formatCurrency(calc.capital)} se transforma en ${formatCurrency(calc.montoFinal)}.`,
            "El interés compuesto es el fenómeno por el cual los intereses generados se suman al capital y a su vez generan nuevos intereses. Es la fuerza más poderosa de las inversiones a largo plazo y la razón por la que empezar temprano marca una diferencia enorme.",
            "Los Fondos Comunes de Inversión (FCI) y los CEDEARs son excelentes vehículos para aprovecharlo: los FCI reinvierten automáticamente los rendimientos, mientras que los CEDEARs permiten invertir en empresas globales con aportes pequeños y reinvertir dividendos.",
            "Para que la estrategia funcione, conviene reinvertir siempre las ganancias (no retirarlas) y mantener la constancia en los aportes mensuales. La diferencia entre un rendimiento del 30% y del 45% anual, sostenida por 10 años, puede más que triplicar el capital final.",
            "Recordá que estos cálculos son nominales: para conocer el rendimiento real debés descontar la inflación esperada del período.",
          ],
        },
        {
          type: "table",
          heading: "Desglose año por año",
          headers: [
            "Año",
            "Capital invertido acumulado",
            "Intereses acumulados",
            "Monto total",
          ],
          rows: calc.yearly.map((row) => [
            String(row.year),
            formatCurrency(row.invertido),
            `+${formatCurrency(row.intereses)}`,
            formatCurrency(row.total),
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
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Calculadora de Interés Compuesto
        </CardTitle>
        <CardDescription>
          Proyectá el crecimiento de tu capital con aportes mensuales y
          reinversión de intereses. Ideal para simular FCI o CEDEARs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="capital">Capital inicial ($)</Label>
              <Input
                id="capital"
                type="number"
                min={0}
                step="1000"
                value={Number.isNaN(capital) ? "" : capital}
                onChange={(e) => setCapital(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aporte">Aporte mensual ($)</Label>
              <Input
                id="aporte"
                type="number"
                min={0}
                step="1000"
                value={Number.isNaN(aporte) ? "" : aporte}
                onChange={(e) => setAporte(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tna-c">Rendimiento estimado (TNA %)</Label>
              <Input
                id="tna-c"
                type="number"
                min={0}
                step="0.01"
                value={Number.isNaN(tna) ? "" : tna}
                onChange={(e) => setTna(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anios">Años de inversión</Label>
              <Input
                id="anios"
                type="number"
                min={1}
                step="1"
                value={Number.isNaN(anios) ? "" : anios}
                onChange={(e) => setAnios(Number(e.target.value))}
              />
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
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-center gap-4">
            <h4 className="text-slate-800 font-bold text-center flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Proyección a {calc.anios} años
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600 text-sm">Total invertido</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatCurrency(calc.capitalInvertido)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600 text-sm">Intereses ganados</span>
                <span className="font-semibold text-emerald-600 tabular-nums">
                  +{formatCurrency(calc.interesesGanados)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-slate-800">
                  Monto final
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                  {formatCurrency(calc.montoFinal)}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Los cálculos no descuentan inflación futura. Compará la TNA con la
              inflación esperada para conocer el rendimiento real.
            </p>
          </div>
        </div>

        {/* Yearly breakdown preview */}
        {calc.yearly.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Desglose año por año
            </h4>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Año</th>
                      <th className="text-right p-2 font-medium">
                        Capital invertido
                      </th>
                      <th className="text-right p-2 font-medium">
                        Intereses
                      </th>
                      <th className="text-right p-2 font-medium">Monto total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.yearly.map((row) => (
                      <tr
                        key={row.year}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-2 text-slate-700 tabular-nums">
                          {row.year}
                        </td>
                        <td className="p-2 text-right text-slate-700 tabular-nums">
                          {formatCurrency(row.invertido)}
                        </td>
                        <td className="p-2 text-right text-emerald-600 tabular-nums">
                          +{formatCurrency(row.intereses)}
                        </td>
                        <td className="p-2 text-right font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(row.total)}
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
