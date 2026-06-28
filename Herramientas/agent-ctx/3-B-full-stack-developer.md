# Task 3-B — Financial Tools (Categorizador, Presupuesto, Suscripciones, Fondo Emergencia)

## Files created
- `/home/z/my-project/src/components/tools/categorizador-tool.tsx` → export `CategorizadorTool`
- `/home/z/my-project/src/components/tools/presupuesto-tool.tsx` → export `PresupuestoTool`
- `/home/z/my-project/src/components/tools/suscripciones-tool.tsx` → export `SuscripcionesTool`
- `/home/z/my-project/src/components/tools/fondo-emergencia-tool.tsx` → export `FondoEmergenciaTool`

## Lint
- `bun run lint` → PASS (0 errores)

## Notes for next agents
- All 4 components are client-side (`"use client"`), no API calls.
- They integrate automatically with `src/components/tools/tools-shell.tsx` (already imports them in TOOL_COMPONENTS).
- Each exports a single component, no extra setup required.
- PDF reports use shared `generatePdfReport` from `@/lib/pdf-report` with sections of type "key-values", "table", and "text".
