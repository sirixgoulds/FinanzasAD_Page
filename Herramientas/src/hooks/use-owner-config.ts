"use client";

import { useSettings } from "@/hooks/use-finance";
import type { TransactionOwner } from "@/lib/types";

/**
 * Hook que provee utilidades de configuración de personas:
 * - getOwnerName(owner): devuelve el nombre configurado para persona1/persona2/pareja
 * - isVisible(owner): si ese owner debe mostrarse según la config de visibilidad
 * - visibleOwners: lista de owners visibles
 * - settings: los settings completos
 *
 * Mientras cargan los settings, usa valores por defecto para no romper la UI.
 */
export function useOwnerConfig() {
  const { data: settings, isLoading } = useSettings();

  const persona1Name = settings?.persona1Name ?? "Persona 1";
  const persona2Name = settings?.persona2Name ?? "Persona 2";
  const showPersona1 = settings?.showPersona1 ?? true;
  const showPersona2 = settings?.showPersona2 ?? true;

  function getOwnerName(owner: TransactionOwner | string): string {
    switch (owner) {
      case "persona1":
        return persona1Name;
      case "persona2":
        return persona2Name;
      case "pareja":
        return "Pareja";
      default:
        return String(owner);
    }
  }

  function getOwnerShort(owner: TransactionOwner | string): string {
    switch (owner) {
      case "persona1":
        return persona1Name.slice(0, 2).toUpperCase();
      case "persona2":
        return persona2Name.slice(0, 2).toUpperCase();
      case "pareja":
        return "Pareja";
      default:
        return String(owner);
    }
  }

  function isVisible(owner: TransactionOwner | string): boolean {
    if (owner === "persona1") return showPersona1;
    if (owner === "persona2") return showPersona2;
    return true; // pareja siempre visible
  }

  const visibleOwners: TransactionOwner[] = [
    ...(showPersona1 ? ["persona1" as const] : []),
    ...(showPersona2 ? ["persona2" as const] : []),
    "pareja" as const,
  ];

  return {
    settings,
    isLoading,
    persona1Name,
    persona2Name,
    showPersona1,
    showPersona2,
    getOwnerName,
    getOwnerShort,
    isVisible,
    visibleOwners,
  };
}
