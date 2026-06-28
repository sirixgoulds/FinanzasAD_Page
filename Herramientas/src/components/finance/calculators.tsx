"use client";

import { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Calculators() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Herramientas &amp; Calculadoras
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Cálculos en tiempo real en tu navegador — sin esperar al servidor.
        </p>
      </div>

      <Tabs defaultValue="tasas">
        <TabsList>
          <TabsTrigger value="tasas">TNA a TEA (Efectiva)</TabsTrigger>
          <TabsTrigger value="compuesto">
            Interés Compuesto (FCI)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasas" className="mt-6">
          <CalcTasas />
        </TabsContent>
        <TabsContent value="compuesto" className="mt-6">
          <CalcCompuesto />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CalcTasas() {
  const [tna, setTna] = useState(40);
  const [dias, setDias] = useState(30);

  const safeDias = Math.max(1, dias || 1);
  const m = 365 / safeDias;
  const i = (tna / 100) * (safeDias / 365);
  const tea = (Math.pow(1 + i, m) - 1) * 100;
  const tem = (Math.pow(1 + tea / 100, 1 / 12) - 1) * 100;

  return (
    <Card className="border-slate-200 shadow-sm max-w-2xl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-500" />
          Calculadora de Tasa Efectiva (TEA)
        </CardTitle>
        <CardDescription>
          Ideal para comparar rendimientos reales de Plazos Fijos tradicionales
          o Billeteras Virtuales según su capitalización.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tna">Tasa Nominal Anual (TNA %)</Label>
            <Input
              id="tna"
              type="number"
              value={tna}
              onChange={(e) => setTna(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Renovación cada (días)</Label>
            <Select
              value={String(dias)}
              onValueChange={(v) => setDias(Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 día (Billeteras virtuales ej. MP)</SelectItem>
                <SelectItem value="30">30 días (Plazo Fijo Tradicional)</SelectItem>
                <SelectItem value="90">90 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-slate-600 font-medium text-sm">
              Tasa Efectiva Mensual (30 días):
            </span>
            <span className="text-lg font-bold text-slate-800 tabular-nums">
              {tem.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium text-sm">
              Tasa Efectiva Anual (TEA):
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 tabular-nums">
              {tea.toFixed(2)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CalcCompuesto() {
  const [capital, setCapital] = useState(100000);
  const [aporte, setAporte] = useState(20000);
  const [tna, setTna] = useState(45);
  const [anios, setAnios] = useState(5);

  const safeTna = Math.max(0, tna || 0);
  const safeAnios = Math.max(1, anios || 1);
  const r = safeTna / 100 / 12;
  const n = safeAnios * 12;
  const fvPrincipal = capital * Math.pow(1 + r, n);
  const fvAportes = r > 0 ? aporte * ((Math.pow(1 + r, n) - 1) / r) : aporte * n;
  const montoTotal = fvPrincipal + fvAportes;
  const capitalInvertido = capital + aporte * n;
  const interesesGanados = montoTotal - capitalInvertido;

  return (
    <Card className="border-slate-200 shadow-sm max-w-4xl">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-2 text-slate-800">
              Simulador Fondo Común / CEDEARs
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Proyectá el crecimiento de tu dinero invirtiendo y reinvirtiendo
              ganancias a largo plazo.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="capital">Capital Inicial ($)</Label>
                <Input
                  id="capital"
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aporte">Aporte Mensual ($)</Label>
                <Input
                  id="aporte"
                  type="number"
                  value={aporte}
                  onChange={(e) => setAporte(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tna2">Rendimiento Estimado (TNA %)</Label>
                <Input
                  id="tna2"
                  type="number"
                  value={tna}
                  onChange={(e) => setTna(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anios">Años de Inversión</Label>
                <Input
                  id="anios"
                  type="number"
                  value={anios}
                  onChange={(e) => setAnios(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-xl flex flex-col justify-center">
            <h4 className="text-indigo-900 font-bold mb-6 text-center flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Proyección a {safeAnios} años
            </h4>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-indigo-200 pb-2">
                <span className="text-indigo-700 text-sm">Total Invertido</span>
                <span className="font-semibold text-indigo-900 tabular-nums">
                  {formatCurrency(capitalInvertido)}
                </span>
              </div>
              <div className="flex justify-between border-b border-indigo-200 pb-2">
                <span className="text-indigo-700 text-sm">Intereses Ganados</span>
                <span className="font-semibold text-emerald-600 tabular-nums">
                  +{formatCurrency(interesesGanados)}
                </span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-base font-bold text-indigo-900">
                  Monto Final
                </span>
                <span className="text-xl sm:text-2xl font-bold text-indigo-900 tabular-nums">
                  {formatCurrency(montoTotal)}
                </span>
              </div>
            </div>
            <p className="text-xs text-indigo-500 mt-6 text-center">
              Nota: Los cálculos no descuentan la inflación futura. Si proyectás
              en Pesos ARS, recordá evaluar la TNA real frente a la inflación
              esperada.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
