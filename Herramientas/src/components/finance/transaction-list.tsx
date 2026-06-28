"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  ArrowRight,
  Landmark,
  Trash2,
  Search,
  Filter,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useTransactions, useDeleteTransaction } from "@/hooks/use-finance";
import { useOwnerConfig } from "@/hooks/use-owner-config";
import { formatCurrency } from "@/lib/finance";
import type { Transaction } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const OWNER_BADGE: Record<string, string> = {
  persona1: "bg-blue-100 text-blue-700",
  persona2: "bg-pink-100 text-pink-700",
  pareja: "bg-purple-100 text-purple-700",
};

const CATEGORY_BADGE: Record<string, string> = {
  Ingresos: "bg-emerald-100 text-emerald-700",
  Inversiones: "bg-indigo-100 text-indigo-700",
  Hormiga: "bg-orange-100 text-orange-700",
  Fijo: "bg-blue-100 text-blue-700",
  "Variable Esencial": "bg-emerald-100 text-emerald-700",
  "Variable Prescindible": "bg-purple-100 text-purple-700",
  "Otro Gasto": "bg-slate-100 text-slate-700",
};

export function TransactionList() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterOwner, setFilterOwner] = useState<string>("all");

  const { data: transactions, isLoading, isError } = useTransactions();
  const del = useDeleteTransaction();
  const { getOwnerShort, isVisible, persona1Name, persona2Name } = useOwnerConfig();

  const filtered = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((t) => {
      // Filtrar por visibilidad configurada
      if (!isVisible(t.owner)) return false;
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterOwner !== "all" && t.owner !== filterOwner) return false;
      if (search && !t.desc.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [transactions, filterType, filterOwner, search, isVisible]);

  async function handleDelete(id: string) {
    try {
      await del.mutateAsync(id);
      toast.success("Movimiento eliminado");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo eliminar");
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-xl font-bold text-slate-800">
            Últimos Movimientos
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 w-40 sm:w-48"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 w-32">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="ingreso">Ingresos</SelectItem>
                <SelectItem value="gasto">Gastos</SelectItem>
                <SelectItem value="inversion">Inversiones</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterOwner} onValueChange={setFilterOwner}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="persona1">{persona1Name}</SelectItem>
                <SelectItem value="persona2">{persona2Name}</SelectItem>
                <SelectItem value="pareja">Pareja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      {isError ? (
        <CardContent className="p-6 text-rose-600">
          Error al cargar movimientos. Recargá la página.
        </CardContent>
      ) : isLoading ? (
        <TransactionListSkeleton />
      ) : filtered.length === 0 ? (
        <CardContent className="p-12 text-center">
          <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            {transactions && transactions.length > 0
              ? "No hay movimientos que coincidan con los filtros."
              : "Aún no registraste movimientos. Creá tu primera operación."}
          </p>
        </CardContent>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase border-b">
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">Concepto</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium hidden md:table-cell">Método</th>
                <th className="p-4 font-medium text-right">Monto</th>
                <th className="p-4 font-medium w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap tabular-nums">
                    {t.date}
                  </td>
                  <td className="p-4 font-medium text-slate-800 max-w-xs">
                    <span className="line-clamp-1">{t.desc}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                          OWNER_BADGE[t.owner]
                        )}
                      >
                        {getOwnerShort(t.owner)}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          CATEGORY_BADGE[t.category] ||
                            "bg-slate-100 text-slate-700"
                        )}
                      >
                        {t.category}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 hidden md:table-cell">
                    <MethodBadge method={t.method} />
                  </td>
                  <td
                    className={cn(
                      "p-4 text-right font-bold tabular-nums whitespace-nowrap",
                      t.type === "ingreso"
                        ? "text-emerald-600"
                        : t.type === "inversion"
                          ? "text-indigo-600"
                          : "text-slate-800"
                    )}
                  >
                    {t.type === "gasto" ? "-" : "+"}
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="p-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDelete(t.id)}
                      disabled={del.isPending}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function MethodBadge({ method }: { method: string }) {
  let icon = <ArrowRight className="w-3.5 h-3.5" />;
  let label = method;
  if (method === "tc") {
    icon = <CreditCard className="w-3.5 h-3.5" />;
    label = "T. Crédito";
  } else if (method === "efectivo") {
    icon = <Landmark className="w-3.5 h-3.5" />;
    label = "Efectivo";
  } else if (method === "transferencia") {
    icon = <ArrowRight className="w-3.5 h-3.5" />;
    label = "Transf.";
  } else if (method === "billetera") {
    icon = <Wallet className="w-3.5 h-3.5" />;
    label = "Billetera";
  }
  return (
    <span className="inline-flex items-center gap-1.5 capitalize text-slate-600">
      {icon}
      {label}
    </span>
  );
}

function TransactionListSkeleton() {
  return (
    <div className="p-4 space-y-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}
