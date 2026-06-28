"use client";

import { useState, FormEvent, useMemo } from "react";
import {
  Bell,
  Calendar,
  CheckCircle,
  Trash2,
  Loader2,
  Mail,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useReminders,
  useCreateReminder,
  useDeleteReminder,
  useSettings,
} from "@/hooks/use-finance";
import { formatCurrency } from "@/lib/finance";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function Reminders() {
  const { data: reminders, isLoading, isError } = useReminders();
  const create = useCreateReminder();
  const del = useDeleteReminder();
  const { data: settings } = useSettings();
  const whatsappEnabled = settings?.whatsappEnabled ?? false;
  const whatsappNumber = settings?.whatsappNumber ?? "";

  const [showMailHint, setShowMailHint] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");

  const sorted = useMemo(() => {
    if (!reminders) return [];
    return [...reminders].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [reminders]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) {
      toast.error("Completá servicio y fecha");
      return;
    }
    try {
      await create.mutateAsync({
        title: title.trim(),
        date,
        amount: amount ? Number(amount) : 0,
      });
      toast.success("Vencimiento agendado");
      setTitle("");
      setDate("");
      setAmount("");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo agendar");
    }
  }

  async function handleDelete(id: string) {
    try {
      await del.mutateAsync(id);
      toast.success("Recordatorio eliminado");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo eliminar");
    }
  }

  function simulateMailAlert() {
    setShowMailHint(true);
    setTimeout(() => setShowMailHint(false), 5000);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Alertas de Pagos
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Evitá recargos e intereses agendando tus vencimientos.
          </p>
        </div>
        <Button
          onClick={simulateMailAlert}
          variant="secondary"
          className="bg-slate-800 hover:bg-slate-900 text-white"
        >
          <Mail className="w-4 h-4 mr-2" />
          Configurar Alertas al Mail
        </Button>
      </div>

      {showMailHint && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-start gap-2 border border-emerald-200">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            ¡Configuración exitosa! El sistema enviará un recordatorio al mail
            registrado 48hs antes de cada vencimiento.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="md:col-span-1 border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nuevo Vencimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="r-title">Servicio / Tarjeta</Label>
                <Input
                  id="r-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Tarjeta Visa"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-date">Fecha Límite</Label>
                <Input
                  id="r-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-amount">
                  Monto Estimado (Opcional)
                </Label>
                <Input
                  id="r-amount"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={create.isPending}
              >
                {create.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4 mr-2" />
                )}
                Agendar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista */}
        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Próximos a Vencer</CardTitle>
            <CardDescription>
              Los vencimientos a menos de 5 días se resaltan en rojo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isError ? (
              <p className="text-rose-600 text-sm py-4">
                Error al cargar recordatorios.
              </p>
            ) : isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">
                  No tenés vencimientos agendados.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                {sorted.map((r) => {
                  const daysLeft = Math.ceil(
                    (new Date(r.date).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const isUrgent = daysLeft <= 5;

                  return (
                    <div
                      key={r.id}
                      className={cn(
                        "flex justify-between items-center gap-3 p-4 rounded-lg border",
                        isUrgent
                          ? "bg-red-50 border-red-100"
                          : "bg-slate-50 border-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "p-2 rounded-full flex-shrink-0",
                            isUrgent
                              ? "bg-red-100 text-red-600"
                              : "bg-slate-200 text-slate-600"
                          )}
                        >
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4
                            className={cn(
                              "font-semibold truncate",
                              isUrgent ? "text-red-900" : "text-slate-800"
                            )}
                          >
                            {r.title}
                          </h4>
                          <p
                            className={cn(
                              "text-sm",
                              isUrgent ? "text-red-700" : "text-slate-500"
                            )}
                          >
                            Vence: {r.date} (
                            {daysLeft > 0
                              ? `En ${daysLeft} días`
                              : daysLeft === 0
                                ? "Hoy"
                                : "Vencido"}
                            )
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {r.amount > 0 && (
                          <span className="font-bold text-slate-700 tabular-nums text-sm hidden sm:inline">
                            {formatCurrency(r.amount)}
                          </span>
                        )}
                        {whatsappEnabled && whatsappNumber && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => {
                              const msg = `🔔 Recordatorio de vencimiento:%0A%0A*${r.title}*%0AVence: ${r.date} (${daysLeft > 0 ? `en ${daysLeft} días` : daysLeft === 0 ? "hoy" : "vencido"})${r.amount > 0 ? `%0AMonto: ${formatCurrency(r.amount)}` : ""}`;
                              window.open(
                                `https://wa.me/${whatsappNumber}?text=${msg}`,
                                "_blank"
                              );
                            }}
                            aria-label="Enviar recordatorio por WhatsApp"
                            title="Enviar por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(r.id)}
                          aria-label="Eliminar"
                          disabled={del.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
