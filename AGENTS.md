## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Frontend conventions

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

