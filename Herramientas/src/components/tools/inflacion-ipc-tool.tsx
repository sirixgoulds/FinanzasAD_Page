"use client";

import { useMemo, useState } from "react";
import { FileDown, Gauge } from "lucide-react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type Mode = "directa" | "mensual";

export function InflacionIpcTool() {
  const [monto, setMonto] = useState(100000);
  const [mesOrigen, setMesOrigen] = useState(1);
  const [anioOrigen, setAnioOrigen] = useState(2023);
  const [acumuladaDirecta, setAcumuladaDirecta] = useState(150);
  const [mensual, setMensual] = useState(7);
  const [meses, setMeses] = useState(12);
  const [mode, setMode] = useState<Mode>("directa");

  const acumulada = useMemo(() => {
    if (mode === "directa") return acumuladaDirecta || 0;
    const m = Math.max(0, mensual || 0) / 100;
    const n = Math.max(0, meses || 0);
    return (Math.pow(1 + m, n) - 1) * 100;
  }, [mode, acumuladaDirecta, mensual, meses]);

  const montoSeguro = monto || 0;
  const valorActualizado = useMemo(
    () => montoSeguro * (1 + acumulada / 100),
    [montoSeguro, acumulada]
  );
  const incrementoNominal = useMemo(
    () => valorActualizado - montoSeguro,
    [valorActualizado, montoSeguro]
  );
  // % de poder adquisitivo perdido del monto original respecto al actualizado
  const perdidaPct = useMemo(() => {
    if (valorActualizado <= 0) return 0;
    return (1 - montoSeguro / valorActualizado) * 100;
  }, [montoSeguro, valorActualizado]);

  function handleDescargar() {
    if (montoSeguro <= 0) {
      toast.error("Ingresá un monto original mayor a 0");
      return;
    }
    if (mode === "mensual" && (mensual < 0 || meses <= 0)) {
      toast.error("Revisá los valores de inflación mensual y meses");
      return;
    }

    const parametros =
      mode === "directa"
        ? [
            { label: "Monto original", value: formatCurrency(montoSeguro) },
            { label: "Período origen", value: `${mesOrigen}/${anioOrigen}` },
            {
              label: "Inflación acumulada (directa)",
              value: `${acumulada.toFixed(2)}%`,
            },
          ]
        : [
            { label: "Monto original", value: formatCurrency(montoSeguro) },
            { label: "Período origen", value: `${mesOrigen}/${anioOrigen}` },
            { label: "Inflación mensual", value: `${mensual}%` },
            { label: "Cantidad de meses", value: `${meses}` },
            {
              label: "Inflación acumulada calculada",
              value: `${acumulada.toFixed(2)}%`,
            },
          ];

    generatePdfReport({
      title: "Ajustador por Inflación (IPC)",
      subtitle: "Actualización de valores históricos al presente",
      sections: [
        { type: "key-values", heading: "Parámetros", rows: parametros },
        {
          type: "key-values",
          heading: "Resultados",
          rows: [
            {
              label: "Valor actualizado",
              value: formatCurrency(valorActualizado),
              highlight: true,
            },
            {
              label: "Incremento nominal",
              value: `+${formatCurrency(incrementoNominal)}`,
              highlight: true,
            },
            {
              label: "Pérdida de poder adquisitivo",
              value: `${perdidaPct.toFixed(2)}%`,
            },
          ],
        },
        {
          type: "text",
          heading: "Información sobre el IPC",
          paragraphs: [
            "El Índice de Precios al Consumidor (IPC) mide la variación del nivel general de precios de los bienes y servicios que consume un hogar tipo. INDEC lo publica mensualmente y es la medida oficial de inflación en Argentina.",
            "Ajustar un valor pasado por inflación es crítico para preservar el poder adquisitivo: $100 de hace un año hoy no compran lo mismo. Actualizar valores te permite comparar montos en términos reales y no dejarte engañar por aumentos nominales.",
            "Casos de uso típicos: ajustar cláusulas de alquiler (el IPC es el índice legal para actualizaciones de contratos de locación según la Ley 27.551), revisar si un aumento de sueldo compensó la inflación, o calcular cuánto debería valer hoy un ahorro del pasado.",
            `En este caso, ${formatCurrency(montoSeguro)} de ${mesOrigen}/${anioOrigen} equivalen a ${formatCurrency(
              valorActualizado
            )} en pesos de hoy, considerando una inflación acumulada del ${acumulada.toFixed(
              2
            )}%. Esto significa que el monto original perdió el ${perdidaPct.toFixed(
              2
            )}% de su poder adquisitivo.`,
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
          <Gauge className="w-5 h-5 text-blue-600" />
          Ajustador por Inflación (IPC)
        </CardTitle>
        <CardDescription>
          Actualizá un monto del pasado a su valor equivalente hoy usando la
          inflación acumulada del IPC.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ipc-monto">Monto original ($)</Label>
              <Input
                id="ipc-monto"
                type="number"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ipc-mes">Mes origen</Label>
                <Input
                  id="ipc-mes"
                  type="number"
                  min={1}
                  max={12}
                  value={mesOrigen}
                  onChange={(e) => setMesOrigen(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipc-anio">Año origen</Label>
                <Input
                  id="ipc-anio"
                  type="number"
                  value={anioOrigen}
                  onChange={(e) => setAnioOrigen(Number(e.target.value))}
                />
              </div>
            </div>

            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as Mode)}
              className="w-full"
            >
              <TabsList className="w-full">
                <TabsTrigger value="directa" className="flex-1">
                  Acumulada directa
                </TabsTrigger>
                <TabsTrigger value="mensual" className="flex-1">
                  Desde mensual
                </TabsTrigger>
              </TabsList>
              <TabsContent value="directa" className="mt-4 space-y-2">
                <Label htmlFor="ipc-acumulada">Inflación acumulada (%)</Label>
                <Input
                  id="ipc-acumulada"
                  type="number"
                  value={acumuladaDirecta}
                  onChange={(e) => setAcumuladaDirecta(Number(e.target.value))}
                />
                <p className="text-xs text-slate-500">
                  Ingresá el porcentaje total de inflación entre el mes de
                  origen y hoy.
                </p>
              </TabsContent>
              <TabsContent value="mensual" className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="ipc-mensual">Inflación mensual (%)</Label>
                    <Input
                      id="ipc-mensual"
                      type="number"
                      value={mensual}
                      onChange={(e) => setMensual(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ipc-meses">Cantidad de meses</Label>
                    <Input
                      id="ipc-meses"
                      type="number"
                      value={meses}
                      onChange={(e) => setMeses(Number(e.target.value))}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Acumulada = (1 + mensual/100)
                  <sup>meses</sup> - 1 ={" "}
                  <span className="font-semibold tabular-nums">
                    {acumulada.toFixed(2)}%
                  </span>
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Results */}
          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3 self-start">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-600 font-medium text-sm">
                Monto original
              </span>
              <span className="text-lg font-semibold text-slate-700 tabular-nums">
                {formatCurrency(montoSeguro)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-600 font-medium text-sm">
                Inflación acumulada
              </span>
              <span className="text-lg font-semibold text-amber-600 tabular-nums">
                {acumulada.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-600 font-medium text-sm">
                Incremento nominal
              </span>
              <span className="text-lg font-semibold text-slate-700 tabular-nums">
                +{formatCurrency(incrementoNominal)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-600 font-medium text-sm">
                Valor actualizado
              </span>
              <span className="text-2xl font-bold text-emerald-600 tabular-nums">
                {formatCurrency(valorActualizado)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium text-sm">
                Poder adquisitivo perdido
              </span>
              <span className="text-lg font-semibold text-rose-600 tabular-nums">
                {perdidaPct.toFixed(2)}%
              </span>
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
