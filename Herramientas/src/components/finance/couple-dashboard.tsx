"use client";

import { useState, FormEvent, useMemo } from "react";
import {
  Users,
  Target,
  TrendingUp,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useTransactions,
  useGoals,
  useCreateGoal,
  useDeleteGoal,
  useUpdateGoal,
} from "@/hooks/use-finance";
import { useOwnerConfig } from "@/hooks/use-owner-config";
import { formatCurrency } from "@/lib/finance";
import type { Transaction, Goal, TransactionOwner } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const GOAL_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  persona1: { bar: "bg-blue-500", bg: "bg-blue-100", text: "text-white" },
  persona2: { bar: "bg-pink-500", bg: "bg-pink-100", text: "text-white" },
  pareja: { bar: "bg-purple-500", bg: "bg-purple-100", text: "text-white" },
};

export function CoupleDashboard() {
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const {
    persona1Name,
    persona2Name,
    showPersona1,
    showPersona2,
    getOwnerName,
  } = useOwnerConfig();

  const stats = useMemo(() => {
    const calc = {
      persona1: { ingresos: 0, gastos: 0 },
      persona2: { ingresos: 0, gastos: 0 },
      pareja: { gastos: 0 },
    };

    (transactions ?? []).forEach((t: Transaction) => {
      const amt = t.amount;
      if (t.owner === "persona1") {
        if (t.type === "ingreso") calc.persona1.ingresos += amt;
        if (t.type === "gasto") calc.persona1.gastos += amt;
      } else if (t.owner === "persona2") {
        if (t.type === "ingreso") calc.persona2.ingresos += amt;
        if (t.type === "gasto") calc.persona2.gastos += amt;
      } else if (t.owner === "pareja") {
        if (t.type === "gasto") calc.pareja.gastos += amt;
      }
    });

    const saldoP1 =
      calc.persona1.ingresos - calc.persona1.gastos - calc.pareja.gastos / 2;
    const saldoP2 =
      calc.persona2.ingresos - calc.persona2.gastos - calc.pareja.gastos / 2;

    return { ...calc, saldoP1, saldoP2 };
  }, [transactions]);

  if (txLoading || goalsLoading) {
    return <CoupleSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Finanzas en Pareja
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Monitoreo de ingresos individuales, egresos compartidos y metas
          conjuntas.
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div
        className={`grid grid-cols-1 gap-4 ${
          showPersona1 && showPersona2
            ? "md:grid-cols-3"
            : showPersona1 || showPersona2
              ? "md:grid-cols-2"
              : "md:grid-cols-1"
        }`}
      >
        {showPersona1 && (
          <PersonCard
            title={persona1Name}
            icon={<Users className="w-5 h-5 text-blue-500" />}
            accent="border-blue-500"
            ingresos={stats.persona1.ingresos}
            gastosPropios={stats.persona1.gastos}
            gastosPareja={stats.pareja.gastos / 2}
            saldo={stats.saldoP1}
          />
        )}
        {showPersona2 && (
          <PersonCard
            title={persona2Name}
            icon={<Users className="w-5 h-5 text-pink-500" />}
            accent="border-pink-500"
            ingresos={stats.persona2.ingresos}
            gastosPropios={stats.persona2.gastos}
            gastosPareja={stats.pareja.gastos / 2}
            saldo={stats.saldoP2}
          />
        )}

        <div className="bg-purple-50 p-5 rounded-xl shadow-sm border-t-4 border-purple-500 flex flex-col justify-center">
          <h3 className="text-base font-bold text-purple-900 flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-500" />
            Egresos Compartidos
          </h3>
          <p className="text-xs text-purple-700 mb-3">
            Total de gastos de la pareja (alquiler, expensas, súper).
          </p>
          <div className="text-2xl sm:text-3xl font-bold text-purple-800 tabular-nums">
            {formatCurrency(stats.pareja.gastos)}
          </div>
          <p className="text-[11px] text-purple-600 mt-2">
            * Se divide a la mitad automáticamente al calcular los saldos
            libres individuales.
          </p>
        </div>
      </div>

      {/* Sugerencia de inversión */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-100">
        <h3 className="text-base font-bold text-emerald-900 mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Sugerencia de Inversión
        </h3>
        <p className="text-sm text-emerald-800 mb-4">
          La regla financiera general recomienda destinar al menos el 20% de tu
          saldo libre a inversión o metas:
        </p>
        <div
          className={`grid grid-cols-1 gap-3 ${
            showPersona1 && showPersona2
              ? "sm:grid-cols-3"
              : "sm:grid-cols-2"
          }`}
        >
          {showPersona1 && (
            <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm flex flex-col justify-center">
              <span className="block text-xs text-slate-500 mb-1">
                Aporte sugerido {persona1Name}
              </span>
              <strong className="text-emerald-600 text-lg tabular-nums">
                {stats.saldoP1 > 0 ? formatCurrency(stats.saldoP1 * 0.2) : "$0"}
              </strong>
            </div>
          )}
          {showPersona2 && (
            <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm flex flex-col justify-center">
              <span className="block text-xs text-slate-500 mb-1">
                Aporte sugerido {persona2Name}
              </span>
              <strong className="text-emerald-600 text-lg tabular-nums">
                {stats.saldoP2 > 0 ? formatCurrency(stats.saldoP2 * 0.2) : "$0"}
              </strong>
            </div>
          )}
          <div className="bg-emerald-600 p-4 rounded-lg shadow-sm text-white flex flex-col justify-center">
            <span className="block text-xs text-emerald-100 mb-1">
              Fondo de Pareja Sugerido
            </span>
            <strong className="text-xl tabular-nums">
              {formatCurrency(
                (Math.max(stats.saldoP1, 0) + Math.max(stats.saldoP2, 0)) * 0.1
              )}
            </strong>
            <span className="block text-[10px] opacity-80 mt-1">
              * 10% del excedente combinado para metas comunes.
            </span>
          </div>
        </div>
      </div>

      {/* Tablero de metas */}
      <GoalsBoard goals={goals ?? []} getOwnerName={getOwnerName} />
    </div>
  );
}

function PersonCard({
  title,
  icon,
  accent,
  ingresos,
  gastosPropios,
  gastosPareja,
  saldo,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  ingresos: number;
  gastosPropios: number;
  gastosPareja: number;
  saldo: number;
}) {
  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm border-t-4 ${accent}`}>
      <h3 className="text-base font-bold text-slate-700 flex items-center gap-2 mb-4">
        {icon}
        {title}
      </h3>
      <div className="space-y-1.5 text-sm">
        <Row label="Ingresos:" value={formatCurrency(ingresos)} valueClass="text-emerald-600" />
        <Row
          label="Gastos Propios:"
          value={`-${formatCurrency(gastosPropios)}`}
          valueClass="text-rose-500"
        />
        <Row
          label="50% Gastos Pareja:"
          value={`-${formatCurrency(gastosPareja)}`}
          valueClass="text-rose-500"
        />
        <div className="pt-2 border-t mt-2 flex justify-between font-bold text-base">
          <span className="text-slate-700">Saldo Libre:</span>
          <span
            className={cn(
              "tabular-nums",
              saldo >= 0 ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {formatCurrency(saldo)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={cn("font-medium tabular-nums", valueClass)}>{value}</span>
    </div>
  );
}

// ============ Tablero de metas ============

function GoalsBoard({
  goals,
  getOwnerName,
}: {
  goals: Goal[];
  getOwnerName: (owner: TransactionOwner | string) => string;
}) {
  const [open, setOpen] = useState(false);
  const { persona1Name, persona2Name } = useOwnerConfig();

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Tablero de Metas
            </CardTitle>
            <CardDescription className="mt-1">
              Seguimiento de objetivos de ahorro individuales y compartidos.
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1.5" />
                Nueva Meta
              </Button>
            </DialogTrigger>
            <NewGoalDialog
              onClose={() => setOpen(false)}
              persona1Name={persona1Name}
              persona2Name={persona2Name}
            />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-10">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">
              Todavía no creaste metas. ¡Definí tu primer objetivo de ahorro!
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {goals.map((goal) => (
              <GoalRow key={goal.id} goal={goal} getOwnerName={getOwnerName} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GoalRow({
  goal,
  getOwnerName,
}: {
  goal: Goal;
  getOwnerName: (owner: TransactionOwner | string) => string;
}) {
  const del = useDeleteGoal();
  const update = useUpdateGoal();
  const [adding, setAdding] = useState("");

  const progress =
    goal.targetAmount > 0
      ? (goal.currentAmount / goal.targetAmount) * 100
      : 0;
  const colors = GOAL_COLORS[goal.owner] ?? GOAL_COLORS.persona1;

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const amt = parseFloat(adding);
    if (isNaN(amt) || amt === 0) return;
    try {
      await update.mutateAsync({ id: goal.id, input: { addAmount: amt } });
      toast.success(
        amt > 0 ? "Aporte registrado" : "Retiro registrado"
      );
      setAdding("");
    } catch (err: any) {
      toast.error(err?.message ?? "Error al actualizar meta");
    }
  }

  async function handleDelete() {
    try {
      await del.mutateAsync(goal.id);
      toast.success("Meta eliminada");
    } catch (err: any) {
      toast.error(err?.message ?? "Error al eliminar meta");
    }
  }

  const completed = progress >= 100;

  return (
    <div className="relative">
      <div className="flex justify-between items-end mb-2 gap-3">
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-700 flex items-center gap-2 flex-wrap">
            <span className="truncate">{goal.title}</span>
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full uppercase font-bold",
                colors.bar,
                colors.text
              )}
            >
              {getOwnerName(goal.owner)}
            </span>
            {completed && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
          </h4>
          <p className="text-xs text-slate-500 capitalize mt-0.5">
            Categoría: {goal.type}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-bold text-slate-800 tabular-nums">
            {formatCurrency(goal.currentAmount)}
          </div>
          <div className="text-xs text-slate-500 tabular-nums">
            / {formatCurrency(goal.targetAmount)}
          </div>
        </div>
      </div>
      <div className={`w-full ${colors.bg} rounded-full h-3`}>
        <div
          className={`${colors.bar} h-3 rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 gap-2">
        <p className="text-xs text-slate-500 tabular-nums">
          {progress.toFixed(1)}% completado
        </p>
        <div className="flex items-center gap-2">
          <form onSubmit={handleAdd} className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="Aportar"
              value={adding}
              onChange={(e) => setAdding(e.target.value)}
              className="h-8 w-24 text-xs"
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="h-8 px-2 text-xs"
              disabled={update.isPending}
            >
              {update.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Sumar"
              )}
            </Button>
          </form>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            onClick={handleDelete}
            aria-label="Eliminar meta"
            disabled={del.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function NewGoalDialog({
  onClose,
  persona1Name,
  persona2Name,
}: {
  onClose: () => void;
  persona1Name: string;
  persona2Name: string;
}) {
  const create = useCreateGoal();
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [owner, setOwner] = useState<"persona1" | "persona2" | "pareja">(
    "pareja"
  );
  const [type, setType] = useState("ahorro");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !targetAmount) {
      toast.error("Completá título y monto objetivo");
      return;
    }
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      toast.error("El monto objetivo debe ser mayor a 0");
      return;
    }
    try {
      await create.mutateAsync({
        title: title.trim(),
        targetAmount: target,
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        owner,
        type,
      });
      toast.success("Meta creada");
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo crear la meta");
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Crear nueva meta</DialogTitle>
        <DialogDescription>
          Definí un objetivo de ahorro individual o compartido.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="g-title">Título</Label>
          <Input
            id="g-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Viaje a Bariloche"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="g-target">Monto Objetivo ($)</Label>
            <Input
              id="g-target"
              type="number"
              min="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="g-current">Monto Inicial (opcional)</Label>
            <Input
              id="g-current"
              type="number"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Responsable</Label>
            <Select
              value={owner}
              onValueChange={(v) =>
                setOwner(v as "persona1" | "persona2" | "pareja")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="persona1">{persona1Name}</SelectItem>
                <SelectItem value="persona2">{persona2Name}</SelectItem>
                <SelectItem value="pareja">Pareja (compartido)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ahorro">Ahorro</SelectItem>
                <SelectItem value="vacaciones">Vacaciones</SelectItem>
                <SelectItem value="compras">Compras</SelectItem>
                <SelectItem value="inversion">Inversión</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={create.isPending}
          >
            {create.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Crear meta
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function CoupleSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
