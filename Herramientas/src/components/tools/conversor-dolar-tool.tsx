"use client";

import { useMemo, useState } from "react";
import { FileDown, DollarSign } from "lucide-react";
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

interface Cotizacion {
  tipo: string;
  descripcion: string;
  valor: number;
}

const DEFAULT_COTIZACIONES: Cotizacion[] = [
  {
    tipo: "Oficial",
    descripcion: "Bancos y casas de cambio (AFIP)",
    valor: 1050,
  },
  {
    tipo: "Blue",
    descripcion: "Mercado informal / caves",
    valor: 1200,
  },
  {
    tipo: "MEP",
    descripcion: "Mercado Electrónico de Pagos (bonos)",
    valor: 1180,
  },
  {
    tipo: "CCL",
    descripcion: "Contado con Liquidación (salida al exterior)",
    valor: 1220,
  },
];

/**
 * Conversor de Dólar Múltiple.
 * Convierte un monto en pesos (ARS) a cada tipo de dólar y viceversa,
 * usando cotizaciones editables por el usuario.
 */
export function ConversorDolarTool() {
  const [cotizaciones, setCotizaciones] =
    useState<Cotizacion[]>(DEFAULT_COTIZACIONES);
  const [montoArs, setMontoArs] = useState<number>(100000);
  const [montoUsd, setMontoUsd] = useState<number>(100);

  const conversiones = useMemo(() => {
    const safeArs = Number.isFinite(montoArs) && montoArs > 0 ? montoArs : 0;
    const safeUsd = Number.isFinite(montoUsd) && montoUsd > 0 ? montoUsd : 0;
    return cotizaciones.map((c) => {
      const safeValor = Number.isFinite(c.valor) && c.valor > 0 ? c.valor : 1;
      return {
        ...c,
        valor: safeValor,
        equivalenteUsd: safeArs / safeValor,
        equivalenteArs: safeUsd * safeValor,
      };
    });
  }, [cotizaciones, montoArs, montoUsd]);

  function handleCotizacionChange(index: number, value: number) {
    setCotizaciones((prev) =>
      prev.map((c, i) => (i === index ? { ...c, valor: value } : c))
    );
  }

  function handleDownloadPdf() {
    const safeArs = Number.isFinite(montoArs) && montoArs > 0 ? montoArs : 0;
    const safeUsd = Number.isFinite(montoUsd) && montoUsd > 0 ? montoUsd : 0;

    if (safeArs <= 0 && safeUsd <= 0) {
      toast.error("Ingresá al menos un monto mayor a 0 (ARS o USD)");
      return;
    }

    generatePdfReport({
      title: "Conversor de Dólar Múltiple",
      subtitle: "Comparativa entre Oficial, Blue, MEP y CCL",
      sections: [
        {
          type: "key-values",
          heading: "Cotizaciones actuales",
          rows: conversiones.map((c) => ({
            label: `Dólar ${c.tipo}`,
            value: formatCurrency(c.valor),
          })),
        },
        {
          type: "key-values",
          heading: "Montos ingresados",
          rows: [
            { label: "Monto en pesos (ARS)", value: formatCurrency(safeArs) },
            { label: "Monto en dólares (USD)", value: `US$ ${safeUsd.toFixed(2)}` },
          ],
        },
        {
          type: "table",
          heading: "Conversión por tipo de dólar",
          headers: [
            "Tipo de dólar",
            "Cotización",
            "Equivalente en USD",
            "Equivalente en ARS",
          ],
          rows: conversiones.map((c) => [
            c.tipo,
            formatCurrency(c.valor),
            `US$ ${c.equivalenteUsd.toFixed(2)}`,
            formatCurrency(c.equivalenteArs),
          ]),
        },
        {
          type: "text",
          heading: "Diferencias entre tipos de dólar",
          paragraphs: [
            "El dólar Oficial es el que cotiza en bancos y casas de cambio bajo regulación AFIP, generalmente con límites mensuales de compra y retenido por impuestos como el Impuesto PAIS.",
            "El dólar Blue se vende en el mercado informal (cuevas) y suele ser la cotización más alta del mercado. Es legal pero opera fuera del circuito bancario, con el riesgo logístico que eso implica.",
            "El dólar MEP (Mercado Electrónico de Pagos) se obtiene comprando y vendiendo bonos en pesos y dólares dentro de Argentina. Es totalmente legal y suele estar por debajo del Blue.",
            "El dólar CCL (Contado con Liquidación) es similar al MEP pero permite girar las divisas al exterior, por lo que suele cotizar un poco más alto. Es el que usan muchos inversores para dolarizar carteras hacia afuera.",
            "Para convertir grandes montos, la brecha entre Oficial y Blue/MEP/CCL impacta directamente en el poder adquisitivo en dólares. Por eso, al evaluar inversiones o gastos en el exterior, conviene usar la cotización que realmente podés acceder (MEP si operás en el mercado, Blue si vas al informal).",
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
          <DollarSign className="w-5 h-5 text-blue-500" />
          Conversor de Dólar Múltiple
        </CardTitle>
        <CardDescription>
          Convertí pesos a dólares y viceversa usando las cotizaciones Oficial,
          Blue, MEP y CCL. Editá los valores si querés reflejar el día de hoy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ars">Monto en pesos (ARS)</Label>
              <Input
                id="ars"
                type="number"
                min={0}
                step="1000"
                value={Number.isNaN(montoArs) ? "" : montoArs}
                onChange={(e) => setMontoArs(Number(e.target.value))}
              />
              <p className="text-xs text-slate-500">
                Mostrará a cuántos USD equivale según cada cotización.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usd">Monto en dólares (USD)</Label>
              <Input
                id="usd"
                type="number"
                min={0}
                step="10"
                value={Number.isNaN(montoUsd) ? "" : montoUsd}
                onChange={(e) => setMontoUsd(Number(e.target.value))}
              />
              <p className="text-xs text-slate-500">
                Mostrará a cuántos ARS equivale según cada cotización.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">
                Cotizaciones editables ($/USD)
              </Label>
              {cotizaciones.map((c, i) => (
                <div key={c.tipo} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm text-slate-700">
                      {c.tipo}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step="1"
                      value={Number.isNaN(c.valor) ? "" : c.valor}
                      onChange={(e) =>
                        handleCotizacionChange(i, Number(e.target.value))
                      }
                      className="w-32 text-right tabular-nums"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 pl-1">
                    {c.descripcion}
                  </p>
                </div>
              ))}
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

          {/* Results table */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">
                Conversión de ARS a USD
              </h4>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="text-left p-3 font-medium">
                          Tipo de dólar
                        </th>
                        <th className="text-right p-3 font-medium">
                          Cotización
                        </th>
                        <th className="text-right p-3 font-medium">
                          Equivalente en USD
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversiones.map((c) => (
                        <tr
                          key={c.tipo}
                          className="border-t border-slate-200 hover:bg-slate-50"
                        >
                          <td className="p-3 text-slate-800 font-medium">
                            {c.tipo}
                          </td>
                          <td className="p-3 text-right text-slate-700 tabular-nums">
                            {formatCurrency(c.valor)}
                          </td>
                          <td className="p-3 text-right font-semibold text-emerald-700 tabular-nums">
                            US$ {c.equivalenteUsd.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">
                Conversión de USD a ARS
              </h4>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="text-left p-3 font-medium">
                          Tipo de dólar
                        </th>
                        <th className="text-right p-3 font-medium">
                          Cotización
                        </th>
                        <th className="text-right p-3 font-medium">
                          Equivalente en ARS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversiones.map((c) => (
                        <tr
                          key={c.tipo}
                          className="border-t border-slate-200 hover:bg-slate-50"
                        >
                          <td className="p-3 text-slate-800 font-medium">
                            {c.tipo}
                          </td>
                          <td className="p-3 text-right text-slate-700 tabular-nums">
                            {formatCurrency(c.valor)}
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-900 tabular-nums">
                            {formatCurrency(c.equivalenteArs)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
