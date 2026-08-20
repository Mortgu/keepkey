## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Frontend conventions

### Komponenten & Design-Token
- `client/src/components/tokens.ts` ist die **einzige** Quelle für Größen, Fokus und Feldzustände. Komponenten definieren diese nicht selbst.
  - Größe: `ACTION_SIZE` (Button/Tab) bzw. `FIELD_SIZE` (Input/Select/NumberField). Beide bauen auf `CONTROL_HEIGHT` + `CONTROL_TEXT` auf — nur so stehen Kontrollen nebeneinander bündig.
  - Fokus: `FIELD_FOCUS` / `FIELD_FOCUS_WITHIN` für Felder, `ACTION_FOCUS` für klickbare Flächen. Nie lokal `focus:`-Klassen erfinden.
  - Zustand: `FIELD_STATE` / `FIELD_STATE_WITHIN` + `fieldState(error, warning)`.
- **Keine Tailwind-Palettenfarben** (`red-500`, `gray-300`, …), **keine `rgba()`/`#hex`-Literale** in `components/`. Farben kommen als CSS-Variable aus `index.css`; abgeleitete Werte über `color-mix()` **dort** definieren, nicht in der Komponente.
- Feldkomponenten rendern Label und Fehler-/Warn-Badge über `<Field>` aus `components/field.tsx` — nicht selbst. Damit ist die Anatomie per Konstruktion identisch.
- `components/index.ts` ist der einzige Einstiegspunkt: `import { … } from "@/components"`, keine Deep-Importe.
- Visuelle Kontrolle über die Route `/dev/components` — dort stehen alle Kontrollen je Größe und Zustand nebeneinander.

Prüfung (muss jeweils leer sein):
```
grep -rnoE "\b(bg|text|border|ring|shadow|outline)-(gray|red|amber|green|blue|neutral|slate|zinc)-[0-9]{2,3}" client/src/components
grep -rn "rgba(\|hsl(" client/src/components
grep -rnoE "#[0-9A-Fa-f]{3,8}\b" client/src/components
```

### Loading states
- Use `<Skeleton/>` / `<ListSkeleton rows skeleton/>` / `<PageHeaderSkeleton/>` from `@/components` for loading states. Do NOT use hardcoded `"Laden..."` / `"Loading..."` strings.
- For list pages: render `<ListSkeleton rows={6} skeleton={<...CardSkeleton/>} />` while `useQuery` returns `isPending`.

### Error states
- Show query errors via `<RouteError error={error}/>` from `@/components` (includes a Retry button that invalidates queries). Do NOT silently ignore `useQuery` `error`.
- The root route (`__root.tsx`) declares a global `errorComponent` + `pendingComponent` as a safety net.

### Toasts & i18n
- Import `showToast` from `@/components` (NOT `toast` from `react-toastify` directly). `showToast.success/.error(key, { vars })` resolves i18n keys via `i18n.t` directly, so it works outside React (in mutations, callbacks, effects).
- Never pass hardcoded German/English strings to toasts — always use i18n keys. Add new keys under the appropriate domain namespace in BOTH `client/locales/de/<namespace>.json` and `client/locales/en/<namespace>.json`.
- Translation files are split by domain: `common.json` (button, nav, section, common), `offers.json` (offerModal, offers.toast), `versionHistory.json`, `dashboard.json`, `errors.json` (AppException codes).
- Server error codes from `AppException.code` are mapped via `errors.json` — use `t("ERROR_CODE")` on the client to display user-facing messages.

### QueryClient
- `QueryClient` defaults live in `__root.tsx`: `staleTime: 30_000`, `gcTime: 5*60_000`, `retry: 1`, `refetchOnWindowFocus: false`, and a global `mutations.onError` safety net.
- Manage query keys via `*Keys` factories (see `client/src/hooks/offers/offers-keys.ts` as the reference pattern). Do NOT use raw string-literal keys like `["offers"]`.

