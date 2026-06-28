"use client";

import { useMemo, useState } from "react";
import { FileDown, Plus, Snowflake, Trash2 } from "lucide-react";
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

interface Deuda {
  id: string;
  nombre: string;
  saldo: number;
  pagoMin: number;
}

interface FilaProyeccion {
  mes: number;
  deudaObjetivo: string;
  pago: number;
  saldoRestante: number;
}

interface ResultadoBolaNieve {
  ordenadas: Array<{
    posicion: number;
    nombre: string;
    saldo: number;
    pagoMin: number;
  }>;
  totalDeuda: number;
  meses: number;
  totalInteres: number;
  proyeccion: FilaProyeccion[];
  sinSolucion: boolean;
}

function nuevoId() {
  return `deuda-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function BolaNieveTool() {
  const [deudas, setDeudas] = useState<Deuda[]>([
    { id: nuevoId(), nombre: "Tarjeta de crédito", saldo: 80000, pagoMin: 5000 },
    { id: nuevoId(), nombre: "Préstamo personal", saldo: 250000, pagoMin: 12000 },
    { id: nuevoId(), nombre: "Cuota auto", saldo: 150000, pagoMin: 9000 },
  ]);
  const [extra, setExtra] = useState(15000);
  const [tasaMensual, setTasaMensual] = useState(5);

  function agregarDeuda() {
    setDeudas((prev) => [
      ...prev,
      { id: nuevoId(), nombre: "", saldo: 0, pagoMin: 0 },
    ]);
  }
  function actualizarDeuda(
    id: string,
    campo: keyof Omit<Deuda, "id">,
    valor: string | number
  ) {
    setDeudas((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [campo]: valor } : d))
    );
  }
  function eliminarDeuda(id: string) {
    setDeudas((prev) => prev.filter((d) => d.id !== id));
  }

  const resultado = useMemo<ResultadoBolaNieve | null>(() => {
    const validas = deudas.filter((d) => d.saldo > 0);
    if (validas.length === 0) return null;

    const ordenadas = [...validas]
      .sort((a, b) => a.saldo - b.saldo)
      .map((d, i) => ({
        posicion: i + 1,
        nombre: d.nombre.trim() || `Deuda ${i + 1}`,
        saldo: d.saldo,
        pagoMin: Math.max(0, d.pagoMin),
      }));

    const state = ordenadas.map((d) => ({ ...d }));
    const rate = (tasaMensual || 0) / 100;
    let snowball = Math.max(0, extra || 0);
    let meses = 0;
    let totalInteres = 0;
    const proyeccion: FilaProyeccion[] = [];
    const MAX_MESES = 600;
    let sinSolucion = false;

    while (state.some((d) => d.saldo > 0.01) && meses < MAX_MESES) {
      meses++;
      // Aplicar intereses
      for (const d of state) {
        if (d.saldo > 0) {
          const interes = d.saldo * rate;
          d.saldo += interes;
          totalInteres += interes;
        }
      }
      // Encontrar deuda objetivo (menor saldo con balance)
      const target = state
        .filter((d) => d.saldo > 0)
        .sort((a, b) => a.saldo - b.saldo)[0];

      // Pagar mínimo en el resto
      for (const d of state) {
        if (d === target) continue;
        if (d.saldo > 0) {
          const pago = Math.min(d.pagoMin, d.saldo);
          d.saldo -= pago;
          if (d.saldo < 0.01) d.saldo = 0;
        }
      }
      // Pagar target: mínimo + snowball
      const pago = Math.min(target.pagoMin + snowball, target.saldo);
      target.saldo -= pago;
      let pagoObjetivo = pago;
      if (target.saldo <= 0.01) {
        target.saldo = 0;
        snowball += target.pagoMin;
        pagoObjetivo = pago; // se liquidó esta deuda
      }
      const saldoTotal = state.reduce((s, d) => s + d.saldo, 0);
      proyeccion.push({
        mes: meses,
        deudaObjetivo: target.nombre,
        pago: pagoObjetivo,
        saldoRestante: saldoTotal,
      });
    }

    if (meses >= MAX_MESES && state.some((d) => d.saldo > 0.01)) {
      sinSolucion = true;
    }

    const totalDeuda = validas.reduce((s, d) => s + d.saldo, 0);

    return {
      ordenadas,
      totalDeuda,
      meses: sinSolucion ? MAX_MESES : meses,
      totalInteres,
      proyeccion,
      sinSolucion,
    };
  }, [deudas, extra, tasaMensual]);

  function handleDescargar() {
    if (!resultado) {
      toast.error("Agregá al menos una deuda con saldo mayor a 0");
      return;
    }
    if (resultado.sinSolucion) {
      toast.warning(
        "El plan no se completa en 600 meses: revisá los pagos mínimos o el extra"
      );
    }

    const proyeccionPdf = resultado.proyeccion.slice(0, 24);
    const footnote =
      resultado.proyeccion.length > 24
        ? `Se muestran los primeros 24 meses de un total de ${resultado.proyeccion.length}.`
        : undefined;

    generatePdfReport({
      title: "Proyector de Cancelación de Deudas — Bola de Nieve",
      subtitle: "Plan de pagos acelerado ordenado por saldo ascendente",
      sections: [
        {
          type: "table",
          heading: "Deudas Ordenadas (menor a mayor saldo)",
          headers: ["Posición", "Deuda", "Saldo", "Pago mín."],
          rows: resultado.ordenadas.map((d) => [
            String(d.posicion),
            d.nombre,
            formatCurrency(d.saldo),
            formatCurrency(d.pagoMin),
          ]),
        },
        {
          type: "key-values",
          heading: "Resumen del Plan",
          rows: [
            { label: "Extra mensual aplicado", value: formatCurrency(extra || 0) },
            {
              label: "Tasa de interés mensual promedio",
              value: `${tasaMensual}%`,
            },
            {
              label: "Total de deuda inicial",
              value: formatCurrency(resultado.totalDeuda),
            },
            {
              label: "Meses estimados para ser libre de deudas",
              value: `${resultado.meses}`,
              highlight: true,
            },
            {
              label: "Intereses totales estimados",
              value: formatCurrency(resultado.totalInteres),
              highlight: true,
            },
          ],
        },
        {
          type: "table",
          heading: "Proyección Mes a Mes (primeros 24 meses)",
          headers: ["Mes", "Deuda objetivo", "Pago", "Saldo restante"],
          rows: proyeccionPdf.map((r) => [
            String(r.mes),
            r.deudaObjetivo,
            formatCurrency(r.pago),
            formatCurrency(r.saldoRestante),
          ]),
          footnote,
        },
        {
          type: "text",
          heading: "Cómo funciona la Bola de Nieve",
          paragraphs: [
            "La estrategia de bola de nieve consiste en ordenar tus deudas de menor a mayor saldo y atacar primero la más chica, mientras pagás el mínimo en las demás. Esto te da victorias rápidas que sostienen la motivación.",
            "Cada vez que cancelás una deuda, su pago mínimo se suma ('rueda') al ataque de la siguiente. El monto que destinás a la deuda objetivo crece mes a mes — de ahí el nombre de 'bola de nieve'.",
            "Aunque matemáticamente el método 'avalancha' (ordenar por tasa de interés) ahorra más intereses, la bola de nieve tiene mayor tasa de éxito porque mantiene la motivación. Para deudas con tasas similares (común en Argentina, donde casi todas las tarjetas cobran tasas parecidas), la diferencia es mínima y la psicología gana.",
            "Tips para que funcione: 1) No agregues nuevas deudas mientras ejecutás el plan. 2) Aumentá el 'extra mensual' cada vez que puedas (aguinaldo, bono, devolución). 3) Celebrá cada victoria cuando cancelás una deuda. 4) Si el plan excede los 60 meses, considerá consolidar deudas o renegotiar tasas.",
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
          <Snowflake className="w-5 h-5 text-blue-600" />
          Proyector de Cancelación de Deudas — Bola de Nieve
        </CardTitle>
        <CardDescription>
          Ordená tus deudas de menor a mayor saldo y obtené un plan de pagos
          acelerado para liquidarlas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs — deudas dinámicas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                Tus deudas
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={agregarDeuda}
                type="button"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {deudas.map((d, i) => (
                <div
                  key={d.id}
                  className="grid grid-cols-[1fr_120px_120px_auto] gap-2 items-end p-3 border border-slate-200 rounded-lg bg-slate-50"
                >
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">
                      Deuda #{i + 1}
                    </Label>
                    <Input
                      type="text"
                      placeholder="Nombre"
                      value={d.nombre}
                      onChange={(e) =>
                        actualizarDeuda(d.id, "nombre", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Saldo ($)</Label>
                    <Input
                      type="number"
                      value={d.saldo}
                      onChange={(e) =>
                        actualizarDeuda(d.id, "saldo", Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Pago mín. ($)</Label>
                    <Input
                      type="number"
                      value={d.pagoMin}
                      onChange={(e) =>
                        actualizarDeuda(
                          d.id,
                          "pagoMin",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => eliminarDeuda(d.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    aria-label="Eliminar deuda"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {deudas.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-6">
                  No hay deudas cargadas. Hacé clic en “Agregar” para empezar.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="bn-extra">Extra mensual ($)</Label>
                <Input
                  id="bn-extra"
                  type="number"
                  value={extra}
                  onChange={(e) => setExtra(Number(e.target.value))}
                />
                <p className="text-xs text-slate-500">
                  Sumá este monto al pago de la deuda más chica.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bn-tasa">Tasa interés mensual (%)</Label>
                <Input
                  id="bn-tasa"
                  type="number"
                  value={tasaMensual}
                  onChange={(e) => setTasaMensual(Number(e.target.value))}
                />
                <p className="text-xs text-slate-500">
                  Promedio de tus deudas (default 5%).
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4 self-start">
            {resultado ? (
              <>
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-slate-600 font-medium text-sm">
                      Total de deuda
                    </span>
                    <span className="text-lg font-semibold text-slate-700 tabular-nums">
                      {formatCurrency(resultado.totalDeuda)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-slate-600 font-medium text-sm">
                      Meses para liberarte
                    </span>
                    <span className="text-2xl font-bold text-emerald-600 tabular-nums">
                      {resultado.meses}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium text-sm">
                      Intereses totales estimados
                    </span>
                    <span className="text-lg font-semibold text-rose-600 tabular-nums">
                      {formatCurrency(resultado.totalInteres)}
                    </span>
                  </div>
                </div>

                {resultado.sinSolucion && (
                  <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">
                    Los pagos mínimos no alcanzan a cubrir los intereses.
                    Aumentá el extra mensual o revisá las deudas.
                  </div>
                )}

                {/* Ordered debts list */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2">
                    <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Orden de ataque
                    </h4>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white">
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Deuda</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                          <TableHead className="text-right">Pago mín.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultado.ordenadas.map((d) => (
                          <TableRow key={d.posicion}>
                            <TableCell className="font-bold text-blue-700 tabular-nums">
                              {d.posicion}
                            </TableCell>
                            <TableCell className="font-medium">
                              {d.nombre}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatCurrency(d.saldo)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-slate-500">
                              {formatCurrency(d.pagoMin)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-50 p-8 rounded-lg border border-dashed border-slate-300 text-center text-sm text-slate-500">
                Agregá al menos una deuda con saldo mayor a 0 para ver el plan.
              </div>
            )}
          </div>
        </div>

        {/* Projección mes a mes */}
        {resultado && resultado.proyeccion.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                Proyección mes a mes
              </h3>
              <span className="text-xs text-slate-500">
                Mostrando {Math.min(24, resultado.proyeccion.length)} de{" "}
                {resultado.proyeccion.length} meses
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50 z-10">
                    <TableRow>
                      <TableHead className="w-16">Mes</TableHead>
                      <TableHead>Deuda objetivo</TableHead>
                      <TableHead className="text-right">Pago</TableHead>
                      <TableHead className="text-right">Saldo restante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultado.proyeccion.slice(0, 24).map((r) => (
                      <TableRow key={r.mes}>
                        <TableCell className="font-medium tabular-nums">
                          {r.mes}
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.deudaObjetivo}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-emerald-600">
                          {formatCurrency(r.pago)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {formatCurrency(r.saldoRestante)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

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
