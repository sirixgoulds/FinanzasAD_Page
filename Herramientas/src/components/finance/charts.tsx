"use client";

import { useMemo } from "react";
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Landmark,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useCharts } from "@/hooks/use-finance";
import { formatCurrency } from "@/lib/finance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_COLORS_HEX: Record<string, string> = {
  Hormiga: "#fb923c",
  Fijo: "#3b82f6",
  "Variable Esencial": "#34d399",
  "Variable Prescindible": "#a855f7",
  "Otro Gasto": "#94a3b8",
  Ingresos: "#10b981",
  Inversiones: "#6366f1",
};

const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#a855f7",
  "#fb923c",
  "#ef4444",
  "#06b6d4",
  "#eab308",
];

export function Charts() {
  const { data, isLoading, isError } = useCharts();

  const pieData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.byCategory)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const barData = useMemo(() => {
    if (!data) return [];
    return data.byMonth.map((m) => ({
      label: m.label,
      Ingresos: m.ingresos,
      Gastos: m.gastos,
      Inversiones: m.inversiones,
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Gráficos
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Visualizá la distribución de tus gastos y la evolución mensual.
        </p>
      </div>

      {isError ? (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-6 text-rose-700">
            No se pudieron cargar los gráficos. Recargá la página.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <ChartsSkeleton />
      ) : (
        <>
          {/* Gráfico de torta — gastos por categoría */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-blue-500" />
                Gastos por Categoría
              </CardTitle>
              <CardDescription>
                Distribución de tus gastos en formato de torta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <div className="text-center py-12">
                  <PieChartIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">
                    No hay gastos registrados para graficar.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          innerRadius={45}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, idx) => (
                            <Cell
                              key={entry.name}
                              fill={
                                CATEGORY_COLORS_HEX[entry.name] ??
                                DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) =>
                            formatCurrency(value)
                          }
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "13px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {pieData.map((entry, idx) => {
                      const total = pieData.reduce(
                        (acc, e) => acc + e.value,
                        0
                      );
                      const pct = ((entry.value / total) * 100).toFixed(1);
                      return (
                        <div
                          key={entry.name}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                CATEGORY_COLORS_HEX[entry.name] ??
                                DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
                            }}
                          />
                          <span className="flex-1 text-slate-700 font-medium">
                            {entry.name}
                          </span>
                          <span className="text-slate-500 tabular-nums">
                            {pct}%
                          </span>
                          <span className="font-semibold text-slate-800 tabular-nums w-28 text-right">
                            {formatCurrency(entry.value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de barras — evolución mensual */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Evolución Mensual
              </CardTitle>
              <CardDescription>
                Ingresos, gastos e inversiones de los últimos 6 meses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {barData.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">
                    No hay suficientes datos para graficar.
                  </p>
                </div>
              ) : (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickFormatter={(v) =>
                          v >= 1000000
                            ? `${(v / 1000000).toFixed(1)}M`
                            : v >= 1000
                              ? `${(v / 1000).toFixed(0)}k`
                              : String(v)
                        }
                        width={50}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name,
                        ]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          fontSize: "13px",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }}
                      />
                      <Bar
                        dataKey="Ingresos"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Gastos"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Inversiones"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen rápido */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MiniStat
              label="Ingresos totales"
              value={barData.reduce((a, m) => a + m.Ingresos, 0)}
              icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
              accent="text-emerald-600"
            />
            <MiniStat
              label="Gastos totales"
              value={barData.reduce((a, m) => a + m.Gastos, 0)}
              icon={<TrendingDown className="w-5 h-5 text-rose-500" />}
              accent="text-rose-600"
            />
            <MiniStat
              label="Inversiones totales"
              value={barData.reduce((a, m) => a + m.Inversiones, 0)}
              icon={<Landmark className="w-5 h-5 text-indigo-500" />}
              accent="text-indigo-600"
            />
          </div>
        </>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className={`text-lg font-bold mt-1 tabular-nums ${accent}`}>
            {formatCurrency(value)}
          </p>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </CardContent>
    </Card>
  );
}

function ChartsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    </div>
  );
}
