"use client";

import { useMemo, useState } from "react";
import { Calculator, FileDown, Percent } from "lucide-react";
import { toast } from "sonner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Calculadora de TNA a TEA.
 * Convierte una Tasa Nominal Anual en Tasa Efectiva Anual (TEA) y Tasa Efectiva
 * Mensual (TEM) según el período de renovación. Útil para comparar plazo fijo
 * tradicional (capitalización mensual) vs billeteras virtuales (capitalización
 * diaria).
 */
export function TnaTeaTool() {
  const [tna, setTna] = useState<number>(40);
  const [dias, setDias] = useState<number>(30);

  const result = useMemo(() => {
    const safeTna = Number.isFinite(tna) && tna > 0 ? tna : 0;
    const safeDias = dias > 0 ? dias : 1;
    const i = (safeTna / 100) * (safeDias / 365);
    const m = 365 / safeDias;
    const tea = (Math.pow(1 + i, m) - 1) * 100;
    const tem = (Math.pow(1 + tea / 100, 1 / 12) - 1) * 100;
    const capitalizaciones = 365 / safeDias;
    return { tna: safeTna, dias: safeDias, tea, tem, capitalizaciones };
  }, [tna, dias]);

  function handleDownloadPdf() {
    if (!result.tna || result.tna <= 0) {
      toast.error("Ingresá una TNA válida mayor a 0");
      return;
    }
    generatePdfReport({
      title: "Calculadora de TNA a TEA",
      subtitle: "Comparación de rendimientos reales por capitalización",
      sections: [
        {
          type: "key-values",
          heading: "Parámetros",
          rows: [
            { label: "Tasa Nominal Anual (TNA)", value: `${result.tna.toFixed(2)}%` },
            { label: "Período de renovación", value: `${result.dias} días` },
            {
              label: "Capitalizaciones por año",
              value: `${result.capitalizaciones.toFixed(2)} veces`,
            },
          ],
        },
        {
          type: "key-values",
          heading: "Resultados",
          rows: [
            {
              label: "Tasa Efectiva Mensual (TEM)",
              value: `${result.tem.toFixed(2)}%`,
              highlight: true,
            },
            {
              label: "Tasa Efectiva Anual (TEA)",
              value: `${result.tea.toFixed(2)}%`,
              highlight: true,
            },
          ],
        },
        {
          type: "text",
          heading: "Conclusiones",
          paragraphs: [
            `Con una TNA del ${result.tna.toFixed(2)}% y renovación cada ${result.dias} días, la Tasa Efectiva Anual (TEA) resulta en ${result.tea.toFixed(2)}% y la Tasa Efectiva Mensual (TEM) en ${result.tem.toFixed(2)}%.`,
            "La TEA representa el rendimiento real que obtenés cuando los intereses se reinvierten (capitalizan) en cada período. Es la métrica correcta para comparar opciones de inversión, ya que tiene en cuenta el efecto del interés compuesto.",
            "Un plazo fijo tradicional a 30 días capitaliza mensualmente, mientras que las billeteras virtuales (MercadoPago, Ualá, Personal Pay, Naranja X) capitalizan diariamente. A igual TNA, cuanto más frecuente es la capitalización, mayor es la TEA.",
            "Por eso, al comparar un plazo fijo a 30 días con una billetera virtual que rinda la misma TNA, la billetera te dará un rendimiento efectivo mayor gracias a la capitalización diaria. Siempre utilizá la TEA (y no la TNA) para comparar entre distintas opciones de inversión.",
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
          <Calculator className="w-5 h-5 text-blue-500" />
          Calculadora de TNA a TEA
        </CardTitle>
        <CardDescription>
          Convertí la Tasa Nominal Anual (TNA) a Tasa Efectiva Anual (TEA) y
          mensual (TEM) según el período de renovación. Ideal para comparar
          plazo fijo vs billetera virtual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tna">Tasa Nominal Anual (TNA %)</Label>
              <div className="relative">
                <Input
                  id="tna"
                  type="number"
                  min={0}
                  step="0.01"
                  value={Number.isNaN(tna) ? "" : tna}
                  onChange={(e) => setTna(Number(e.target.value))}
                  className="pr-10"
                />
                <Percent className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Período de renovación</Label>
              <Select
                value={String(dias)}
                onValueChange={(v) => setDias(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 día (Billetera virtual)</SelectItem>
                  <SelectItem value="30">
                    30 días (Plazo fijo tradicional)
                  </SelectItem>
                  <SelectItem value="90">90 días</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                A más renovaciones por año, mayor es la TEA a igual TNA.
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
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-center gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-600 font-medium text-sm">
                  Tasa Efectiva Mensual (TEM)
                </span>
                <span className="text-xl font-bold text-slate-800 tabular-nums">
                  {result.tem.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-600 font-medium text-sm">
                  Tasa Efectiva Anual (TEA)
                </span>
                <span className="text-3xl font-bold text-emerald-600 tabular-nums">
                  {result.tea.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
                <span>Capitalizaciones por año</span>
                <span className="tabular-nums">
                  {result.capitalizaciones.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              La TEA refleja el rendimiento real al reinvertir los intereses.
              A igual TNA, más capitalizaciones = mayor TEA.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
