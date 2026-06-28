"use client";

import { useState } from "react";
import { ArrowLeft, Wrench } from "lucide-react";
import { TOOLS, TOOL_CATEGORIES, type ToolId } from "@/lib/tools-registry";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ToolsShellProps {
  initialTool?: ToolId;
  onNavigateToReminders?: () => void;
}

export function ToolsShell({
  initialTool,
  onNavigateToReminders,
}: ToolsShellProps) {
  const [activeTool, setActiveTool] = useState<ToolId | null>(
    initialTool ?? null
  );

  function handleSelectTool(toolId: ToolId) {
    const tool = TOOLS.find((t) => t.id === toolId);
    if (tool?.externalLink === "reminders" && onNavigateToReminders) {
      onNavigateToReminders();
      return;
    }
    setActiveTool(toolId);
  }

  // Vista de una herramienta específica
  if (activeTool) {
    const tool = TOOLS.find((t) => t.id === activeTool);
    if (!tool) {
      setActiveTool(null);
      return null;
    }
    const ToolComponent = TOOL_COMPONENTS[activeTool];
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTool(null)}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a herramientas
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2.5 rounded-xl">
            <tool.icon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{tool.title}</h2>
            <p className="text-sm text-slate-500">{tool.description}</p>
          </div>
        </div>
        {ToolComponent ? (
          <ToolComponent />
        ) : (
          <Card>
            <CardContent className="p-6 text-slate-500">
              Herramienta no disponible.
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Vista del grid de herramientas (toolbar)
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Wrench className="w-7 h-7 text-blue-600" />
          Herramientas Financieras
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          13 calculadoras y simuladores para optimizar tus finanzas. Cada una
          permite exportar un PDF detallado.
        </p>
      </div>

      {TOOL_CATEGORIES.map((category) => {
        const categoryTools = TOOLS.filter((t) => t.category === category);
        return (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleSelectTool(tool.id)}
                  className="group text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex gap-3 items-start"
                >
                  <div className="bg-blue-50 group-hover:bg-blue-100 p-2.5 rounded-lg transition-colors flex-shrink-0">
                    <tool.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-800 text-sm leading-tight">
                      {tool.shortTitle}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Mapa de componentes — importados dinámicamente para evitar errores
// si algún archivo aún no existe. Se llenará a medida que se crean las herramientas.
import { TnaTeaTool } from "@/components/tools/tna-tea-tool";
import { InteresCompuestoTool } from "@/components/tools/interes-compuesto-tool";
import { BilleterasTool } from "@/components/tools/billeteras-tool";
import { CuotasCftTool } from "@/components/tools/cuotas-cft-tool";
import { ConversorDolarTool } from "@/components/tools/conversor-dolar-tool";
import { CategorizadorTool } from "@/components/tools/categorizador-tool";
import { PresupuestoTool } from "@/components/tools/presupuesto-tool";
import { SuscripcionesTool } from "@/components/tools/suscripciones-tool";
import { FondoEmergenciaTool } from "@/components/tools/fondo-emergencia-tool";
import { InflacionIpcTool } from "@/components/tools/inflacion-ipc-tool";
import { PrestamosFrancesTool } from "@/components/tools/prestamos-frances-tool";
import { BolaNieveTool } from "@/components/tools/bola-nieve-tool";

const TOOL_COMPONENTS: Partial<Record<ToolId, React.ComponentType>> = {
  "tna-tea": TnaTeaTool,
  "interes-compuesto": InteresCompuestoTool,
  billeteras: BilleterasTool,
  "cuotas-cft": CuotasCftTool,
  "conversor-dolar": ConversorDolarTool,
  categorizador: CategorizadorTool,
  "presupuesto-50-30-20": PresupuestoTool,
  suscripciones: SuscripcionesTool,
  "fondo-emergencia": FondoEmergenciaTool,
  "inflacion-ipc": InflacionIpcTool,
  "prestamos-frances": PrestamosFrancesTool,
  "bola-nieve": BolaNieveTool,
};
