"use client";

import { useState, FormEvent } from "react";
import {
  User as UserIcon,
  Users,
  Bell,
  Eye,
  Save,
  Loader2,
  CheckCircle2,
  MessageCircle,
  Phone,
  Database,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSettings,
  useUpdateSettings,
  useUpdateProfile,
} from "@/hooks/use-finance";
import type { UserSettings } from "@/lib/types";
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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export function Settings() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Configuración
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Personalizá tu cuenta, personas, alertas y visibilidad.
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
          <TabsTrigger value="account" className="text-xs sm:text-sm">
            <UserIcon className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Cuenta</span>
          </TabsTrigger>
          <TabsTrigger value="persons" className="text-xs sm:text-sm">
            <Users className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Personas</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs sm:text-sm">
            <Bell className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="visibility" className="text-xs sm:text-sm">
            <Eye className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Visibilidad</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="text-xs sm:text-sm">
            <Database className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Datos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <SettingsLoader>
            {(s) => <AccountForm key={s.id} settings={s} />}
          </SettingsLoader>
        </TabsContent>
        <TabsContent value="persons" className="mt-6">
          <SettingsLoader>
            {(s) => <PersonsForm key={s.id} settings={s} />}
          </SettingsLoader>
        </TabsContent>
        <TabsContent value="alerts" className="mt-6">
          <SettingsLoader>
            {(s) => <AlertsForm key={s.id} settings={s} />}
          </SettingsLoader>
        </TabsContent>
        <TabsContent value="visibility" className="mt-6">
          <SettingsLoader>
            {(s) => <VisibilityForm key={s.id} settings={s} />}
          </SettingsLoader>
        </TabsContent>
        <TabsContent value="data" className="mt-6">
          <DataManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Wrapper que carga los settings y renderiza el contenido interno
 * solo cuando están disponibles, usando `key` para que el estado interno
 * se inicialice correctamente desde los valores cargados (sin useEffect).
 */
function SettingsLoader({
  children,
}: {
  children: (settings: UserSettings) => React.ReactNode;
}) {
  const { data: settings, isLoading } = useSettings();
  if (isLoading || !settings) return <SettingsSkeleton />;
  return <>{children(settings)}</>;
}

// ============ Cuenta (nombre) ============

function AccountForm({ settings }: { settings: UserSettings }) {
  const update = useUpdateProfile();
  const [name, setName] = useState(settings.name ?? "");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    try {
      await update.mutateAsync({
        name: name.trim(),
        email: settings.email,
      });
      toast.success("Nombre actualizado");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo actualizar");
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-blue-500" />
          Datos de usuario
        </CardTitle>
        <CardDescription>Tu nombre visible en la aplicación.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={update.isPending}
          >
            {update.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ============ Data Management ============

function DataManagement() {
  function exportData() {
    const data = window.localStorage.getItem("finanzas-ar-data");
    const blob = new Blob([data || "{}"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finanzas-ar-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        JSON.parse(content); // Validate JSON
        window.localStorage.setItem("finanzas-ar-data", content);
        toast.success("Datos importados correctamente. Recargando...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        toast.error("Archivo inválido o corrupto.");
      }
    };
    reader.readAsText(file);
  }

  function clearData() {
    if (confirm("¿Estás seguro de que quieres borrar todos los datos locales? Esto no se puede deshacer.")) {
      window.localStorage.removeItem("finanzas-ar-data");
      toast.success("Datos eliminados. Recargando...");
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          Gestión de Datos
        </CardTitle>
        <CardDescription>
          Importá o exportá tus datos financieros.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={exportData} className="bg-blue-600 hover:bg-blue-700 flex-1">
            <Download className="w-4 h-4 mr-2" /> Exportar a JSON
          </Button>
          <div className="relative flex-1">
            <Input
              type="file"
              accept=".json"
              onChange={importData}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" /> Importar de JSON
            </Button>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-red-600">Peligro</p>
          <Button onClick={clearData} variant="destructive" className="w-full sm:w-auto">
            Borrar todos los datos locales
          </Button>
        </div>
        
        <p className="text-xs text-slate-500 mt-4">
          Tus datos se guardan exclusivamente en el almacenamiento local de este navegador (LocalStorage). Recordá exportarlos periódicamente para tener una copia de seguridad y poder restaurarlos en otros dispositivos.
        </p>
      </CardContent>
    </Card>
  );
}

// ============ Nombres de personas ============

function PersonsForm({ settings }: { settings: UserSettings }) {
  const update = useUpdateSettings();
  const [p1, setP1] = useState(settings.persona1Name);
  const [p2, setP2] = useState(settings.persona2Name);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!p1.trim() || !p2.trim()) {
      toast.error("Ambos nombres son obligatorios");
      return;
    }
    try {
      await update.mutateAsync({
        persona1Name: p1.trim(),
        persona2Name: p2.trim(),
      });
      toast.success("Nombres actualizados");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo actualizar");
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Nombres de las personas
        </CardTitle>
        <CardDescription>
          Personalizá cómo se llaman las personas en toda la app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p1-name" className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Persona 1
              </Label>
              <Input
                id="p1-name"
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                placeholder="Ej. Juan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p2-name" className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                Persona 2
              </Label>
              <Input
                id="p2-name"
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                placeholder="Ej. María"
                required
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Estos nombres aparecerán en el dashboard, movimientos y finanzas en
            pareja.
          </p>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={update.isPending}
          >
            {update.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar nombres
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ============ Alertas (WhatsApp) ============

function AlertsForm({ settings }: { settings: UserSettings }) {
  const update = useUpdateSettings();
  const [enabled, setEnabled] = useState(settings.whatsappEnabled);
  const [number, setNumber] = useState(settings.whatsappNumber ?? "");

  async function handleToggle(checked: boolean) {
    setEnabled(checked);
    if (!checked) {
      try {
        await update.mutateAsync({ whatsappEnabled: false });
        toast.success("Alertas de WhatsApp desactivadas");
      } catch (err: any) {
        toast.error(err?.message ?? "No se pudo actualizar");
        setEnabled(true);
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!number.trim()) {
      toast.error("Ingresá tu número de WhatsApp");
      return;
    }
    const clean = number.replace(/[^0-9]/g, "");
    if (clean.length < 8) {
      toast.error("El número no es válido");
      return;
    }
    try {
      await update.mutateAsync({
        whatsappEnabled: true,
        whatsappNumber: clean,
      });
      toast.success("Alertas de WhatsApp configuradas");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo actualizar");
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-emerald-500" />
          Alertas por WhatsApp
        </CardTitle>
        <CardDescription>
          Recibí recordatorios de vencimientos por WhatsApp.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div>
            <p className="font-medium text-slate-800">
              Activar alertas de WhatsApp
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Al activarse, cada vencimiento tendrá un botón para enviar el
              recordatorio por WhatsApp.
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            aria-label="Activar alertas de WhatsApp"
          />
        </div>

        {enabled && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wa-number" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                Número de WhatsApp
              </Label>
              <Input
                id="wa-number"
                type="tel"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Ej. 5491112345678 (con código de país)"
                required
              />
              <p className="text-xs text-slate-500">
                Incluí el código de país (54 para Argentina). Ej:{" "}
                <code className="bg-slate-100 px-1 rounded">5491112345678</code>
              </p>
            </div>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={update.isPending}
            >
              {update.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Guardar número
            </Button>
          </form>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
          <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <strong>Cómo funciona:</strong> Cuando un vencimiento esté próximo,
            vas a ver un botón de WhatsApp en la sección &laquo;Vencimientos&raquo;.
            Al presionarlo, se abrirá WhatsApp con el mensaje de recordatorio
            pre-armado para tu número.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ Visibilidad ============

function VisibilityForm({ settings }: { settings: UserSettings }) {
  const update = useUpdateSettings();
  const [showP1, setShowP1] = useState(settings.showPersona1);
  const [showP2, setShowP2] = useState(settings.showPersona2);

  async function handleToggle(
    person: "persona1" | "persona2",
    checked: boolean
  ) {
    if (person === "persona1") setShowP1(checked);
    else setShowP2(checked);
    try {
      const input =
        person === "persona1"
          ? { showPersona1: checked }
          : { showPersona2: checked };
      await update.mutateAsync(input);
      const name =
        person === "persona1" ? settings.persona1Name : settings.persona2Name;
      toast.success(`${name} ${checked ? "visible" : "oculta"}`);
    } catch (err: any) {
      if (person === "persona1") setShowP1(!checked);
      else setShowP2(!checked);
      toast.error(err?.message ?? "No se pudo actualizar");
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          Visibilidad de datos por persona
        </CardTitle>
        <CardDescription>
          Elegí qué personas se muestran en el dashboard, movimientos y
          finanzas en pareja.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <VisibilityRow
          name={settings.persona1Name}
          color="bg-blue-500"
          checked={showP1}
          onToggle={(c) => handleToggle("persona1", c)}
        />
        <VisibilityRow
          name={settings.persona2Name}
          color="bg-pink-500"
          checked={showP2}
          onToggle={(c) => handleToggle("persona2", c)}
        />
        <Separator className="my-4" />
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2">
          <Eye className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            <strong>Nota:</strong> Al ocultar una persona, sus transacciones no
            aparecerán en la lista de movimientos ni en el dashboard de pareja.
            Los datos no se eliminan, solo se ocultan.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function VisibilityRow({
  name,
  color,
  checked,
  onToggle,
}: {
  name: string;
  color: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <div>
          <p className="font-medium text-slate-800">{name}</p>
          <p className="text-xs text-slate-500">
            {checked ? "Visible en la app" : "Oculto en la app"}
          </p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onToggle}
        aria-label={`Mostrar ${name}`}
      />
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  );
}
