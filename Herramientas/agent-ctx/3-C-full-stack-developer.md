# Task 3-C — Financial Tools (Inflación IPC, Préstamos Francés, Bola de Nieve)

## Files created
- `/home/z/my-project/src/components/tools/inflacion-ipc-tool.tsx` → export `InflacionIpcTool`
- `/home/z/my-project/src/components/tools/prestamos-frances-tool.tsx` → export `PrestamosFrancesTool`
- `/home/z/my-project/src/components/tools/bola-nieve-tool.tsx` → export `BolaNieveTool`

## Lint
- `bun run lint` → PASS (0 errores, 0 warnings)

## Notes for next agents
- All 3 components are client-side (`"use client"`), no API calls.
- They integrate automatically with `src/components/tools/tools-shell.tsx` (already imports them in TOOL_COMPONENTS).
- Each exports a single component, no extra setup required.
- PDF reports use shared `generatePdfReport` from `@/lib/pdf-report` with sections of type "key-values", "table", and "text".
- All monetary values use `formatCurrency` from `@/lib/finance`.
- No `useEffect` + `setState` — derived values use `useMemo` exclusively (lint rule `react-hooks/set-state-in-effect`).
- Tables with many rows use `max-h-96 overflow-y-auto` containers with sticky headers.

## Per-component notes

### InflacionIpcTool
- Two input modes (Tabs): (a) accumulated inflation % direct, (b) monthly % + months → accumulated = (1+m/100)^n - 1.
- "Pérdida de poder adquisitivo" calculated as `(1 - monto/valorActualizado) * 100`.
- PDF includes 3 sections: key-values (parámetros), key-values (resultados highlight), text (IPC explanation referencing Ley 27.551 for alquiler).

### PrestamosFrancesTool
- French amortization: cuota = monto * (r * (1+r)^n) / ((1+r)^n - 1) where r = tasa/100/12.
- Handles edge case r=0 (cuota = monto / n).
- Full schedule computed in useMemo, UI shows first 12, PDF shows first 24 (or all if shorter).
- PDF sections: key-values (parámetros), key-values (resultados), table (cronograma), text (sistema francés explanation — intereses front-loaded).

### BolaNieveTool
- Dynamic debt list with add/remove (each row: nombre, saldo, pago mínimo).
- Snowball strategy: order by saldo asc, pay minimums on all + extra on smallest; when paid off, roll minimum into snowball.
- Applies monthly interest to all balances each iteration.
- Safety: caps at 600 months; shows "sinSolucion" warning if minimums don't cover interest.
- Default tasa mensual = 5% (editable).
- PDF sections: table (deudas ordenadas), key-values (resumen highlight), table (proyección 24 meses), text (explicación bola de nieve).

## Shared patterns
- Layout: `grid grid-cols-1 md:grid-cols-2 gap-6` (inputs left, results right; stacks on mobile).
- Results panel: `bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3 self-start`.
- "Descargar PDF" button: `variant="outline"` + `FileDown` icon from lucide-react, aligned right with `border-t border-slate-100` separator.
- Color accents: emerald (positivo), rose (negativo/pérdida), amber (advertencia), blue (headers/iconos) — matches existing app palette.
