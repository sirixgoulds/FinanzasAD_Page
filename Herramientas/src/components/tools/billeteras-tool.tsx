"use client";

import { useMemo, useState } from "react";
import { FileDown, Wallet } from "lucide-react";
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

interface Billetera {
  nombre: string;
  tna: number;
}

const DEFAULT_BILLETERAS: Billetera[] = [
  { nombre: "MercadoPago", tna: 30 },
  { nombre: "Ualá", tna: 33 },
  { nombre: "Personal Pay", tna: 35 },
  { nombre: "Naranja X", tna: 38 },
  { nombre: "Brubank", tna: 32 },
];

/**
 * Comparador de Billeteras Virtuales.
 * Compara el rendimiento de las principales billeteras virtuales argentinas
 * a partir de un monto a invertir y sus TNA editables.
 */
export function BilleterasTool() {
  const [monto, setMonto] = useState<number>(100000);
  const [billeteras, setBilleteras] = useState<Billetera[]>(DEFAULT_BILLETERAS);

  const resultados = useMemo(() => {
    const safeMonto = Number.isFinite(monto) && monto > 0 ? monto : 0;
    return billeteras.map((b) => {
      const safeTna = Number.isFinite(b.tna) && b.tna >= 0 ? b.tna : 0;
      const diario = (safeMonto * (safeTna / 100)) / 365;
      const mensual = (safeMonto * (safeTna / 100)) / 12;
      const anual = safeMonto * (safeTna / 100);
      return { ...b, diario, mensual, anual };
    });
  }, [billeteras, monto]);

  const mejorDiaria = useMemo(() => {
    if (resultados.length === 0) return null;
    return resultados.reduce((best, cur) =>
      cur.diario > best.diario ? cur : best
    );
  }, [resultados]);

  function handleTnaChange(index: number, value: number) {
    setBilleteras((prev) =>
      prev.map((b, i) => (i === index ? { ...b, tna: value } : b))
    );
  }

  function handleDownloadPdf() {
    const safeMonto = Number.isFinite(monto) && monto > 0 ? monto : 0;
    if (safeMonto <= 0) {
      toast.error("Ingresá un monto a invertir mayor a 0");
      return;
    }

    const mejor = mejorDiaria;
    generatePdfReport({
      title: "Comparador de Billeteras Virtuales",
      subtitle: "Rendimiento diario, mensual y anual por billetera",
      sections: [
        {
          type: "key-values",
          heading: "Monto invertido",
          rows: [
            { label: "Capital colocado", value: formatCurrency(safeMonto) },
          ],
        },
        {
          type: "table",
          heading: "Comparativa de rendimiento",
          headers: [
            "Billetera",
            "TNA %",
            "Rendimiento diario",
            "Rendimiento mensual",
            "Rendimiento anual",
          ],
          rows: resultados.map((r) => [
            r.nombre,
            `${r.tna.toFixed(2)}%`,
            formatCurrency(r.diario),
            formatCurrency(r.mensual),
            formatCurrency(r.anual),
          ]),
        },
        {
          type: "text",
          heading: "Recomendación",
          paragraphs: mejor
            ? [
                `Con ${formatCurrency(safeMonto)} colocados, la billetera que mejor rendimiento diario brinda es ${mejor.nombre} con una TNA del ${mejor.tna.toFixed(2)}%, generando ${formatCurrency(mejor.diario)} por día y ${formatCurrency(mejor.mensual)} por mes.`,
                "Aunque las diferencias de TNA parezcan chicas (2 o 3 puntos), a lo largo del año se traducen en miles de pesos de diferencia. Por eso conviene siempre colocar el dinero en la billetera con la TNA más alta disponible.",
                "Recordá que las billeteras virtuales capitalizan diariamente, por lo que la TEA real es levemente superior a la TNA publicada. Para movimientos grandes, también tené en cuenta límites de extracción y tiempos de acreditación.",
                "Estos valores son referenciales y las TNA pueden cambiar. Verificá las condiciones vigentes en la app de cada billetera antes de invertir.",
              ]
            : ["No hay billeteras configuradas para comparar."],
        },
      ],
    });
    toast.success("PDF generado correctamente");
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-500" />
          Comparador de Billeteras Virtuales
        </CardTitle>
        <CardDescription>
          Compará el rendimiento de las principales billeteras argentinas.
          Editá las TNA si querés reflejar las tasas actuales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monto-b">Monto a invertir ($)</Label>
              <Input
                id="monto-b"
                type="number"
                min={0}
                step="1000"
                value={Number.isNaN(monto) ? "" : monto}
                onChange={(e) => setMonto(Number(e.target.value))}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">
                TNA por billetera (editable)
              </Label>
              {billeteras.map((b, i) => (
                <div key={b.nombre} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-slate-700">
                    {b.nombre}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={Number.isNaN(b.tna) ? "" : b.tna}
                    onChange={(e) => handleTnaChange(i, Number(e.target.value))}
                    className="w-24 text-right tabular-nums"
                  />
                  <span className="text-xs text-slate-400 w-4">%</span>
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
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="text-left p-3 font-medium">Billetera</th>
                      <th className="text-right p-3 font-medium">TNA</th>
                      <th className="text-right p-3 font-medium">Diario</th>
                      <th className="text-right p-3 font-medium">Mensual</th>
                      <th className="text-right p-3 font-medium">Anual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((r) => {
                      const esMejor =
                        mejorDiaria?.nombre === r.nombre;
                      return (
                        <tr
                          key={r.nombre}
                          className={`border-t border-slate-200 ${
                            esMejor ? "bg-emerald-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="p-3 text-slate-800 font-medium">
                            {r.nombre}
                            {esMejor && (
                              <span className="ml-2 text-[10px] uppercase tracking-wide text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Mejor
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right text-slate-700 tabular-nums">
                            {r.tna.toFixed(2)}%
                          </td>
                          <td className="p-3 text-right text-slate-700 tabular-nums">
                            {formatCurrency(r.diario)}
                          </td>
                          <td className="p-3 text-right text-slate-700 tabular-nums">
                            {formatCurrency(r.mensual)}
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-900 tabular-nums">
                            {formatCurrency(r.anual)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {mejorDiaria && (
              <p className="text-sm text-slate-600 mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                <span className="font-semibold text-emerald-800">
                  {mejorDiaria.nombre}
                </span>{" "}
                te rinde{" "}
                <span className="font-semibold tabular-nums">
                  {formatCurrency(mejorDiaria.diario)}
                </span>{" "}
                por día, la mejor opción diaria de la comparativa.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
