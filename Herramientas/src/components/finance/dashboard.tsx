"use client";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Landmark,
  PieChart,
  AlertCircle,
} from "lucide-react";
import { useDashboard } from "@/hooks/use-finance";
import {
  formatCurrency,
  CATEGORY_COLORS,
} from "@/lib/finance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  const { data, isLoading, isError } = useDashboard();

  if (isError) {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <CardContent className="p-6 text-rose-700">
          No se pudo cargar el resumen. Intentá recargar la página.
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const { summary } = data;
  const categories = Object.entries(summary.gastosPorCategoria).filter(
    ([, val]) => val > 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Resumen Financiero
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Agregado calculado en servidor para máxima velocidad.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo Disponible"
          amount={summary.balance}
          icon={<Wallet className="w-7 h-7 text-blue-500" />}
          accent="border-blue-500"
        />
        <StatCard
          title="Ingresos Totales"
          amount={summary.ingresos}
          icon={<TrendingUp className="w-7 h-7 text-emerald-500" />}
          accent="border-emerald-500"
        />
        <StatCard
          title="Gastos Totales"
          amount={summary.gastos}
          icon={<TrendingDown className="w-7 h-7 text-rose-500" />}
          accent="border-rose-500"
        />
        <StatCard
          title="Inversiones"
          amount={summary.inversiones}
          icon={<Landmark className="w-7 h-7 text-indigo-500" />}
          accent="border-indigo-500"
        />
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <PieChart className="w-5 h-5 text-slate-500" />
            Análisis de Gastos por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.gastos === 0 ? (
            <p className="text-slate-500 italic py-4">
              No hay gastos registrados para analizar.
            </p>
          ) : (
            <div className="space-y-4">
              {categories
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => {
                  const percent = ((amount / summary.gastos) * 100).toFixed(1);
                  const colorClass =
                    CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] ||
                    "bg-slate-300";

                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-slate-700">
                          {cat}
                        </span>
                        <span className="text-slate-600 tabular-nums">
                          {formatCurrency(amount)} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`${colorClass} h-2.5 rounded-full transition-all duration-700`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
          </div>
          <div>
            <p className="text-sm text-blue-700">
              <strong>Tip Fiscal:</strong> Si sos Monotributista, tus gastos y
              consumos con tarjeta de crédito son monitoreados por ARCA. Mantené
              tus gastos (Categorías Fijos + Variables + Hormiga) por debajo del
              límite de tu categoría de facturación para evitar exclusiones de
              oficio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  amount,
  icon,
  accent,
}: {
  title: string;
  amount: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      className={`bg-white p-5 rounded-xl shadow-sm border-b-4 ${accent} hover:shadow-md transition-shadow`}
    >
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <h4 className="text-xl sm:text-2xl font-bold mt-2 text-slate-800 tabular-nums truncate">
            {formatCurrency(amount)}
          </h4>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-lg flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
