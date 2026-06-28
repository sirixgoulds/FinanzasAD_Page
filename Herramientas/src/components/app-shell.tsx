"use client";

import { useState, type ReactNode } from "react";
import {
  Activity,
  PieChart,
  Wallet,
  Wrench,
  Bell,
  PlusCircle,
  Users,
  LogOut,
  Menu,
  X,
  Sparkles,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { useSeed, useDashboard } from "@/hooks/use-finance";

export type TabId =
  | "dashboard"
  | "couple"
  | "new"
  | "transactions"
  | "tools"
  | "reminders"
  | "charts"
  | "settings";

interface NavItemDef {
  id: TabId;
  label: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItemDef[] = [
  { id: "dashboard", label: "Dashboard", icon: <PieChart /> },
  { id: "couple", label: "Finanzas en Pareja", icon: <Users /> },
  { id: "new", label: "Nueva Operación", icon: <PlusCircle /> },
  { id: "transactions", label: "Movimientos", icon: <Wallet /> },
  { id: "charts", label: "Gráficos", icon: <BarChart3 /> },
  { id: "tools", label: "Herramientas", icon: <Wrench /> },
  { id: "reminders", label: "Vencimientos", icon: <Bell /> },
  { id: "settings", label: "Configuración", icon: <SettingsIcon /> },
];

export function AppShell({
  children,
}: {
  children: (props: { activeTab: TabId; setActiveTab: (id: TabId) => void }) => ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const seed = useSeed();

  function handleNav(id: TabId) {
    setActiveTab(id);
    setMobileOpen(false);
  }

  async function handleSeed() {
    try {
      await seed.mutateAsync();
      toast.success("Datos de ejemplo cargados. ¡Explora la app!");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudieron cargar los datos");
    }
  }

  const navContent = (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => handleNav(item.id)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
            activeTab === item.id
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          )}
        >
          <span className="w-5 h-5 flex items-center justify-center">
            {item.icon}
          </span>
          <span className="flex-1 text-left">{item.label}</span>
        </button>
      ))}
    </nav>
  );

  const userPanel = (
    <div className="border-t border-slate-800 p-3 space-y-2">
      <div className="flex items-center gap-3 px-2 py-2">
        <Avatar className="w-9 h-9 border border-slate-700">
          <AvatarFallback className="bg-slate-800 text-blue-400 text-sm font-semibold">
            FA
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            Usuario
          </p>
          <p className="text-xs text-slate-400 truncate">Modo Estático</p>
        </div>
      </div>
    </div>
  );

  const headerBranding = (
    <div className="p-5 border-b border-slate-800">
      <h1 className="text-xl font-bold flex items-center gap-2 text-white">
        <span className="bg-blue-600 p-1.5 rounded-lg">
          <Activity className="w-5 h-5" />
        </span>
        Finanzas AR
      </h1>
      <p className="text-[11px] text-slate-400 mt-1.5 ml-1">
        Modo Contador Experto
      </p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col flex-shrink-0 sticky top-0 h-screen">
          {headerBranding}
          {navContent}
          {userPanel}
        </aside>

        {/* Sidebar móvil (Sheet) */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="lg:hidden fixed top-4 left-4 z-40 bg-slate-900 text-white p-2.5 rounded-lg shadow-lg"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 p-0 bg-slate-900 text-white border-slate-800"
          >
            <SheetHeader className="p-0">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full relative">
              {headerBranding}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-4 text-slate-400 hover:text-white"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
              {navContent}
              {userPanel}
            </div>
          </SheetContent>
        </Sheet>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
            <EmptyStateBanner
              activeTab={activeTab}
              onSeed={handleSeed}
              loading={seed.isPending}
            />
            {children({ activeTab, setActiveTab: handleNav })}
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

function EmptyStateBanner({
  activeTab,
  onSeed,
  loading,
}: {
  activeTab: TabId;
  onSeed: () => void;
  loading: boolean;
}) {
  const { data, isLoading } = useDashboard();

  if (activeTab !== "dashboard" || isLoading || !data) return null;
  if (data.counts.totalTransactions > 0) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          ¿Primera vez por aquí?
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Carga datos de ejemplo para explorar la app. Podés borrarlos cuando
          quieras desde &laquo;Movimientos&raquo;.
        </p>
      </div>
      <Button
        onClick={onSeed}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading ? "Cargando…" : "Cargar datos de ejemplo"}
      </Button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <p>
          <span className="font-semibold text-slate-700">Finanzas AR</span> ·
          Gestión financiera personal
        </p>
        <p className="text-slate-400">
          Tus datos se guardan en tu cuenta, de forma privada y segura.
        </p>
      </div>
    </footer>
  );
}
