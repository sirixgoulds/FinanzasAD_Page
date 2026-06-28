"use client";

import { useState, FormEvent, useMemo } from "react";
import {
  PlusCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateTransaction } from "@/hooks/use-finance";
import { autoCategorizeExpense, resolveCategory } from "@/lib/finance";
import type { TabId } from "@/components/app-shell";
import {
  Card,
  CardContent,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface Props {
  onDone: (tab: TabId) => void;
}

export function NewTransactionForm({ onDone }: Props) {
  const create = useCreateTransaction();

  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"gasto" | "ingreso" | "inversion">("gasto");
  const [method, setMethod] = useState<
    "efectivo" | "transferencia" | "tc" | "billetera"
  >("transferencia");
  const [owner, setOwner] = useState<"persona1" | "persona2" | "pareja">(
    "persona1"
  );

  const previewCat = useMemo(() => {
    if (type === "gasto" && desc.length > 2) {
      return autoCategorizeExpense(desc);
    }
    return "";
  }, [desc, type]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!desc.trim() || !amount) {
      toast.error("Completá concepto y monto");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    try {
      await create.mutateAsync({
        date,
        desc: desc.trim(),
        amount: amt,
        type,
        method,
        owner,
        category: resolveCategory(type, desc),
      });
      toast.success("Operación guardada");
      // Reset
      setDesc("");
      setAmount("");
      onDone("transactions");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo guardar la operación");
    }
  }

  const isSubmitting = create.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl font-bold text-slate-800">
            Registrar Operación
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tipo + Fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Operación</Label>
                <Select
                  value={type}
                  onValueChange={(v) =>
                    setType(v as "gasto" | "ingreso" | "inversion")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasto">Gasto / Egreso</SelectItem>
                    <SelectItem value="ingreso">Ingreso / Cobro</SelectItem>
                    <SelectItem value="inversion">
                      Inversión (FCI, MEP, etc.)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Owner */}
            <div className="space-y-2">
              <Label>¿A quién corresponde?</Label>
              <RadioGroup
                value={owner}
                onValueChange={(v) =>
                  setOwner(v as "persona1" | "persona2" | "pareja")
                }
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100"
              >
                <OwnerRadio
                  value="persona1"
                  label="Persona 1"
                  accent="text-blue-600"
                />
                <OwnerRadio
                  value="persona2"
                  label="Persona 2"
                  accent="text-pink-600"
                />
                <OwnerRadio
                  value="pareja"
                  label="Gasto Compartido"
                  accent="text-purple-600"
                />
              </RadioGroup>
            </div>

            {/* Concepto */}
            <div className="space-y-2">
              <Label htmlFor="desc">Concepto / Descripción</Label>
              <Input
                id="desc"
                type="text"
                placeholder="Ej. Supermercado, Alquiler, Sueldo…"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
              />
              {previewCat && (
                <p className="text-sm mt-1 text-slate-500 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Se categorizará automáticamente como:{" "}
                  <strong className="text-blue-600">{previewCat}</strong>
                </p>
              )}
            </div>

            {/* Monto + Método */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto (ARS)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select
                  value={method}
                  onValueChange={(v) =>
                    setMethod(
                      v as "efectivo" | "transferencia" | "tc" | "billetera"
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">
                      Transferencia / Débito
                    </SelectItem>
                    <SelectItem value="tc">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="billetera">
                      Billetera Virtual (MercadoPago)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Guardar Operación
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function OwnerRadio({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <Label
      htmlFor={`owner-${value}`}
      className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-white transition-colors"
    >
      <RadioGroupItem
        id={`owner-${value}`}
        value={value}
        className={accent}
      />
      <span className="text-sm text-slate-700 font-medium">{label}</span>
    </Label>
  );
}
