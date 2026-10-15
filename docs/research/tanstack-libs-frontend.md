# Weitere TanStack-Libs im Frontend (Table, Pacer & Co.)

Frage: Wie sinnvoll sind weitere TanStack-Libs wie Table oder Pacer, um Frontend-Komponenten voll funktionsfähig zu machen (Tabellen mit Filter, Suche, Sortierung, Paging)?

Repo-Stand geprüft: Branch `xml_test`, HEAD `6e3a6d6c`, inklusive der uncommitteten Änderungen an `customer-flow-tab.tsx`. Bibliotheksstand vom 2026-10-15, laut npm-Registry und tanstack.com. Es wurde kein Quellcode geändert.

## TL;DR

| Lib | Verdikt | Kurzbegründung |
|---|---|---|
| **Router-Search-Params** (`validateSearch` + Zod) | **einsetzen, zuerst** | Schon installiert und auf 6 Routen angelegt, wird aber kaum genutzt. Filter, Sortierung und Seite leben heute in `useState` und gehen beim Reload verloren. Das ist der größte Hebel und kostet nichts. |
| **Query `placeholderData: keepPreviousData`** | **einsetzen** | Ein Einzeiler, damit die Liste beim Filtern oder Blättern nicht flackert. |
| **TanStack Table v9** | **einsetzen, gezielt** | Für echte Tabellen mit Sortierung, Spaltenfiltern, Paging oder Auswahl, z. B. „Vorgänge“, Kundenpreise und Einkaufspreise. v9 ist seit 2026-08 stabil. Für Karten-Listen (Kunden, Angebote, Aufträge) ist es nicht nötig. Server-Daten laufen im `manual*`-Modus. |
| **TanStack Pacer** | **nicht nötig, vorerst** | Das Repo hat schon einen 10-Zeilen-`useDebouncedValue`. Pacer ist laut eigener Doku „beta“ (v0.24). Erst sinnvoll, wenn Throttle, Rate-Limit, Queue oder Async-Debounce mit Abbruch gebraucht werden. |
| **TanStack Form** | **schon im Einsatz** | `@tanstack/react-form` ^1.33, 25 Dateien. Dabei bleiben. Die v2 ist erst Alpha. |
| **TanStack Virtual** | **später, bei Bedarf** | Erst bei Listen mit Tausenden Zeilen im DOM. Server-Paging löst das hier besser. |
| **TanStack DB** | **nicht nötig** | Beta, v0.5. Query plus gezielte Invalidierung reicht für ein REST-CRUD-Backend. |
| **TanStack Store** | **nicht direkt** | Kommt transitiv mit Table v9 und Pacer, braucht keine eigene Einführung. |
| **TanStack Hotkeys** | **später** | Laut eigener Doku Alpha. |
| **TanStack Ranger** | **nicht nötig** | v0.0.5, letzter Release 2025-12. Es gibt keinen Bedarf an Range-Slidern. |

Der dringendste Gewinn kommt nicht aus einer neuen Lib. Er entsteht, wenn der Filter-State einheitlich in die URL wandert, die Suche überall debounced wird und die Server-Endpunkte die Parameter, die der Client schickt, auch auswerten. Mehrere Lücken dazu stehen im nächsten Abschnitt.

---

## Ist-Zustand im Repo

### Installierte Pakete (`client/package.json`)
- `@tanstack/react-router` ^1.167.5 (Lockfile 1.170.18), `@tanstack/react-query` ^5.91.2 (Lockfile 5.101.4) und `@tanstack/react-form` ^1.33.0 (Lockfile 1.33.2).
- Dev-Abhängigkeiten: `@tanstack/router-plugin`, `@tanstack/router-cli` und `@tanstack/eslint-config`.
- UI: **Base UI** (`@base-ui/react` ^1.7.0) mit Tailwind v4, `tailwind-variants` und `lucide-react`. Es gibt **kein shadcn/ui und kein Radix**. Die eigenen Komponenten liegen unter `client/src/components/elements/` (`search-bar.tsx`, `multi-dropdown.tsx`, `sort-dropdown.tsx`, `filter-chip.tsx` usw.).
- Für Fuzzy-Suche im Autocomplete wird `match-sorter` genutzt (`customers/-components/customer-autocomplete.tsx:2,88`).
- React 19 läuft mit `babel-plugin-react-compiler`.

### Filter-/Suchmuster heute
Jede Liste hat einen eigenen `use*-filters`-Hook mit fast identischem Aufbau:
- `client/src/routes/_main/customers/-page.hooks.ts:12-55`
- `client/src/components/modules/modals/offer/_hooks/use-offer-filters.ts:13-66`
- `client/src/routes/_main/orders/-hooks/use-order-filters.ts:13-47`
- `suppliers/-hooks/use-supplier-filters.ts`, `employees/-hooks/use-employee-filters.ts`, `workloads/-hooks/use-workload-filters.ts` und `flatrates/-hooks/use-flatrate-filters.ts`

Diese Hooks teilen dasselbe Muster:
1. **Die URL wird nur einmal gelesen und nie geschrieben.** Der Hook macht `useSearch({ strict: false })` und daraus `useState(urlSearch.search ?? "")`, z. B. in `use-offer-filters.ts:14-16`. Sortierung und Multi-Filter (Land, Sprache, Kunde, Kontakt, Workload) stehen nur in `useState`. Reload, Teilen und Zurück verlieren diesen Zustand. Die Routen deklarieren `validateSearch` nur mit `search` (und bei Kunden `sort`), z. B. `customers/index.tsx:5-12`, `offers/index.tsx:5-12` und `orders/index.tsx:5-12`.
2. **Auf den Listen-Seiten gibt es keinen Debounce.** `SearchBar` (`components/elements/search-bar.tsx:14-27`) gibt jeden Tastendruck an `setSearchInput` weiter. Das landet direkt in `params` und damit im Query-Key, also feuert **jeder Tastendruck einen Request**. Das betrifft Angebote, Kunden, Aufträge, Lieferanten und Mitarbeiter. Debounced wird nur auf der globalen Suche (`search/-page.tsx:61`) und in der Angebotsliste des Auftrags-Modals (`orders/-components/modal/order-modal.offer-list.tsx:17`). Der dafür vorhandene Hook steht in `client/src/hooks/use-debounce.ts:3-12`.
3. **Ein Vorbild existiert schon.** `search/-page.tsx:52-75` hält einen lokalen Input-State, debounced ihn, schreibt ihn per `navigate({ search, replace: true })` in die URL und fragt erst dann ab. Das ist im Kern das empfohlene Muster unten.

### Tabellen
Echte Tabellen sind selten. Die meisten Listen sind Karten-Listen (`CustomerListItem`, `OrderCard`, `OfferListItem`).
- **„Vorgänge“** (`customers/$customerId/-components/tabs/customer-flow-tab.tsx`) ist eine CSS-Grid-Tabelle mit festen Spalten (`:24`).
  - Es gibt keine Sortierung und kein Paging.
  - `searchQuery` (`:85`) ist an die `SearchBar` (`:98`) gebunden, wird aber **nicht** an `useOffers` (`:87-89`) übergeben. Die Suche ist also wirkungslos.
  - Das `.map` in `:68` hat keinen `key`.
- Echte `<table>`-Elemente gibt es in `customer-prices-tab.tsx:53`, `orders/-components/purchase-price-table.tsx` und `workloads/pricing/-components/tariff-component.tsx`. Alle sind statisch, ohne Sortierung oder Filter.

### Server-Seite
- **Kunden**: Suche und Sortierung laufen auf dem Server (`server/src/services/customer.service.ts:16-34`). Land und Sprache werden **im Client** nachgefiltert, und zwar zweimal: `customers/-page.hooks.ts:61-68` und `customers/-components/customer-list.tsx:26-36`. Es gibt kein Paging.
- **Angebote**: Suche, ID-Filter und Sortierung laufen auf dem Server, dazu Cursor-Paging mit `limit` (Default 50) (`server/src/services/offer/offer-queries.ts:40-83`, Schema `shared/src/offer.schema.ts:245-256`). Der Client wertet `nextCursor` auf der Angebotsseite **nicht aus**: Es werden höchstens 50 Angebote angezeigt, ohne „mehr laden“. `useInfiniteQuery` wird nirgends genutzt.
- **Aufträge**: Der Client schickt `search` und `sort` (`use-order-filters.ts:25-29`). `orderFilterSchema` (`shared/src/order.schema.ts:199-202`) und `getAllOrders` (`server/src/services/order.service.ts:25-49`) kennen aber nur `companyIds`. **Suche und Sortierung auf der Auftragsseite wirken also nicht.**
- **Lieferanten, Mitarbeiter, Workloads, Pauschalen**: Suche und Sortierung laufen auf dem Server, ohne Paging (`supplier.service.ts:13-23`, `user.service.ts:13-23`, `product.service.ts:19-26` und `flat-rate.service.ts:12-19`).
- **Datenmengen**: Aus dem Repo nicht ableitbar (**unverifiziert**). Für ein B2B-Lizenz- und Angebotstool sind Kunden und Lieferanten vermutlich im Hunderter-Bereich. Angebote und Aufträge wachsen dagegen unbegrenzt, dort ist Server-Paging nötig.

---

## Router: Search-Params als Zuhause für Filter-State

- Mit Zod v4 geht das Schema direkt in `validateSearch`, ohne Adapter: „With Zod v4, you should directly use the schema in `validateSearch`“. Für Zod v3 gibt es `zodValidator` und `fallback`. Quelle: https://tanstack.com/router/latest/docs/framework/react/guide/search-params. Das Repo nutzt Zod ^4.4.3, die Variante ohne Adapter passt also.
- Lesen geht mit `Route.useSearch()`. Schreiben geht mit `navigate({ search: (prev) => ({ ... }) })` oder über das `search`-Prop von `<Link>` (gleiche Quelle).
- Mit `stripSearchParams(defaultValues)` entfernt man Default-Werte aus der URL, mit `retainSearchParams([...])` behält man Parameter über Navigationen hinweg. Beides läuft über `middlewares` (gleiche Quelle).
- Für Loader gibt es `loaderDeps`, falls man später per Route-Loader vorladen will (gleiche Quelle).

**Verdikt: einsetzen.** Das löst Reload, Teilbarkeit und Zurück, ersetzt die sieben `use*-filters`-Hooks durch je ein Zod-Schema und ist schon installiert. Die Schemas können aus `@keepit/schemas` kommen, z. B. `offerFilterSchema`. Damit validieren Client-URL und Server-Query dieselbe Form.

## Query: `keepPreviousData`

- `import { keepPreviousData, useQuery } from '@tanstack/react-query'` mit `placeholderData: keepPreviousData`. `isPlaceholderData` zeigt an, dass noch die Daten der vorigen Query angezeigt werden. Quelle: https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries
- Für „mehr laden“ beim bestehenden Cursor-Paging der Angebote passt `useInfiniteQuery`. Die Table-Doku zeigt Beispiele für Page-Index-Paging mit `useQuery` und Cursor-Paging mit `useInfiniteQuery`: https://tanstack.com/table/latest/docs/guide/client-side-vs-server-side

**Verdikt: einsetzen**, in den `*Queries.list`-Factories oder in den Hooks.

## TanStack Table (`@tanstack/react-table`)

**Was es ist:** eine Headless-Tabellenlogik. Die Lib liefert State und APIs, Markup und Styles schreibt man selbst. Eingebaut sind u. a. Column-/Global-Filtering, Faceting, Row-Sorting, Row-Pagination, Row-Selection, Column-Visibility, -Pinning, -Sizing und Expanding. Laut Doku ist das volle v9-Paket „about 25 KB“ minified und Brotli-komprimiert. Weil Features einzeln registriert werden, ist Tree-Shaking möglich. Quelle: https://tanstack.com/table/latest/docs/overview

**Status:**
- `latest` ist 9.3.1. 9.0.0 erschien am 2026-08-04, die letzte v8 war 8.21.3 (2025-04). Quelle: https://registry.npmjs.org/@tanstack/react-table
- Peer-Abhängigkeit ist `react >=18`, die Lib hängt von `@tanstack/react-store` ab (gleiche Quelle).

**v9-API (verifiziert im Migrationsguide, https://tanstack.com/table/latest/docs/framework/react/guide/migrating):**
- „`useReactTable` is now `useTable`“. Die Optionen enthalten jetzt ein explizites `features`.
- `features` wird mit `tableFeatures({ ... })` gebaut. Feature-Namen sind z. B. `rowSortingFeature`, `rowPaginationFeature`, `columnFilteringFeature` und `globalFilteringFeature`. Row-Models stehen als Slots im selben Aufruf: `sortedRowModel: createSortedRowModel()`, `filteredRowModel: createFilteredRowModel()` und `paginatedRowModel: createPaginatedRowModel()`.
- `createColumnHelper<typeof features, TData>()`.
- `table.state` (optional mit Selector), `table.Subscribe` für feingranulare Re-Renders. `onStateChange` wurde entfernt, die einzelnen `on[State]Change`-Handler bleiben.
- `useLegacyTable` aus `@tanstack/react-table/legacy` ist ein als deprecated markierter v8-Kompatibilitätsweg.
- `flexRender` aus v8 funktioniert weiter (laut shadcn-Guide, s. u.).
- **Achtung:** Viele Tutorials und LLM-Antworten zeigen noch die v8-API (`useReactTable`, `getCoreRowModel`). Die passt nicht zu v9.

**Client- vs. Server-Verarbeitung:** https://tanstack.com/table/latest/docs/guide/client-side-vs-server-side
- „Client-side processing is usually the simplest approach“ und „tables with just a few thousand rows are often practical in the browser“. Server-Verarbeitung lohnt sich, wenn „fetching the complete dataset would be slow, expensive, or memory-intensive“.
- „A `manual*` option does not fetch or transform data“. Es gibt `manualFiltering`, `manualSorting` und `manualPagination`. Bei manuellem Paging gibt man `rowCount` oder `pageCount` an. Bei Cursor-Paging ist `pageCount: -1` erlaubt, dann kann `getCanNextPage()` das Ende aber nicht kennen.
- Kontrollierter State läuft über `state: { pagination }` mit `onPaginationChange` bzw. `state: { sorting }` mit `onSortingChange`. `SortingState = ColumnSort[]` mit `{ id, desc }`. Zum Verdrahten der UI gibt es `column.getToggleSortingHandler()` und `column.getIsSorted()`. Quellen: https://tanstack.com/table/latest/docs/framework/react/guide/pagination und https://tanstack.com/table/latest/docs/framework/react/guide/sorting
- `manualPagination` schaltet `autoResetPageIndex` standardmäßig ab (Client-vs-Server-Guide).

**shadcn/ui:** Der offizielle Data-Table-Guide nutzt inzwischen v9 (`useTable`, `tableFeatures()`). Er liefert bewusst keine fertige Komponente, sondern eine Anleitung zum Selbstbauen, weil es „doesn't make sense to combine all of these variations into a single component“. Quelle: https://ui.shadcn.com/docs/components/data-table. Für dieses Repo ist das eine Vorlage, keine Abhängigkeit. Die Table-Doku listet außerdem ein Beispiel `kitchen-sink-shadcn-base`, also shadcn auf Base UI (https://tanstack.com/table/latest). Das kommt dem Stack hier am nächsten.

**Bewertung für keepit:**
- **Sinnvoll** für die echten Tabellen „Vorgänge“, Kundenpreise, Einkaufspreise und Tarife, sobald dort Spalten-Sortierung, Spalten-Sichtbarkeit, Auswahl für Bulk-Aktionen oder Paging gebraucht werden. Auch eine generische `DataTable`-Komponente in `components/modules` lohnt sich, die Sortier-Header, Pagination-Leiste und Empty- und Loading-States einheitlich liefert.
- **Architektur:** Wo Daten unbegrenzt wachsen (Angebote, Aufträge), Server-Modus mit `manualSorting`, `manualFiltering` und `manualPagination`. Der State kommt aus den Router-Search-Params, die Daten aus Query. Bei kleinen, begrenzten Mengen (Preise eines Kunden, Tarifzeilen) Client-Modus mit Row-Models.
- **Nicht nötig** für die Karten-Listen. Dort bringt Table wenig, weil es kein Spalten-Modell gibt. Router-Params, Query und Debounce reichen.
- **Kosten:** etwa 25 KB br für das volle Paket, laut Doku. Mit nur Sorting und Pagination ist es weniger, die Doku nennt aber keine Werte pro Feature (**unverifiziert**). Dazu kommt Lernaufwand für die neue v9-API.

## TanStack Pacer (`@tanstack/react-pacer`)

- Debounce, Throttle, Rate-Limit, Queue und Batch, jeweils mit Async-Varianten (Retry, Abort), State auf Basis von TanStack Store. Die Doku sagt: „currently in **beta**“, die „API is still subject to change“. Quelle: https://tanstack.com/pacer/latest/docs/overview
- `latest` ist 0.24.1 (2026-10-05). Abhängig von `@tanstack/pacer` und `@tanstack/react-store`. Quelle: https://registry.npmjs.org/@tanstack/react-pacer
- React-Hooks sind u. a. `useDebouncedValue`, `useDebouncedState`, `useDebouncedCallback`, `useDebouncer`, `useAsyncDebouncer`, `useThrottledValue` und `useRateLimiter`. Quelle: https://tanstack.com/pacer/latest/docs/framework/react/reference/index
- Die Signatur ist `useDebouncedValue(value, { wait })` und liefert `[debouncedValue, debouncer]`. Quelle: https://tanstack.com/pacer/latest/docs/framework/react/reference/functions/useDebouncedValue
- Eine eingebaute Integration mit Query oder Router beschreibt die Overview nicht.

**Bewertung:** ehrlich gesagt redundant zum vorhandenen `client/src/hooks/use-debounce.ts`. Für „Suchfeld debouncen“ bringt Pacer nur `cancel`/`flush` und Pending-State, und den Pending-State liefert bei Suche ohnehin `isFetching` von Query. Query bricht veraltete Requests über den Query-Key-Wechsel ab, das ersetzt Async-Debounce mit Abort weitgehend. **Nicht nötig, solange nur Debounce gebraucht wird.** Neu prüfen, wenn Throttling (z. B. Autosave im Docx-Editor), Rate-Limiting gegen externe APIs oder Queues im Client nötig werden. Dann ist es besser als Eigenbau, aber Beta.

## TanStack Form (`@tanstack/react-form`)

- Schon im Einsatz: ^1.33.0, 25 Dateien, z. B. `components/modules/modals/offer/_hooks/use-offer-modal-form.ts`.
- npm: `latest` 1.33.5, daneben ein `alpha` 2.0.0-alpha.2. Quelle: https://registry.npmjs.org/@tanstack/react-form
- **Verdikt:** dabei bleiben, nicht auf v2 Alpha wechseln. Für Filterleisten braucht man Form **nicht**. Filter sind URL-State, kein Formular mit Submit und Validierung.

## TanStack Virtual (`@tanstack/react-virtual`)

- Headless-Virtualisierung langer Listen mit `useVirtualizer` (`count`, `getScrollElement`, `estimateSize`, `getVirtualItems()`, `getTotalSize()`). Quelle: https://tanstack.com/virtual/latest/docs/introduction
- `latest` ist 3.14.19, stabil. Quelle: https://registry.npmjs.org/@tanstack/react-virtual
- **Verdikt: später.** Nur wenn sehr viele Zeilen gleichzeitig im DOM liegen. Mit Server-Paging (50 pro Seite) tritt das nicht auf.

## TanStack DB (`@tanstack/react-db`)

- Ein reaktiver Client-Store über Query: Collections (`queryCollectionOptions` aus `@tanstack/query-db-collection`), `useLiveQuery` mit `where`, `join` und `orderBy`, optimistische Mutationen mit Rollback. Funktioniert auch über REST ohne Sync-Engine. Quelle: https://tanstack.com/db/latest/docs/overview
- Status: „Tanstack DB is currently in BETA“ (https://github.com/TanStack/db), `latest` 0.5.10 (https://registry.npmjs.org/@tanstack/react-db).
- **Verdikt: nicht nötig.** Das wäre ein Architekturwechsel für Daten, die heute schlicht serverseitig gefiltert werden. Interessant würde es erst bei stark optimistischer, offline-naher UI.

## TanStack Store (`@tanstack/react-store`)

- `latest` 0.11.2, daneben `1.0.0-alpha.0`. Quelle: https://registry.npmjs.org/@tanstack/react-store
- Ist eine Abhängigkeit von Table v9, Pacer und Hotkeys (Registry-Metadaten wie oben).
- **Verdikt:** nicht direkt einführen. Kommt transitiv, falls Table genutzt wird.

## TanStack Hotkeys (`@tanstack/react-hotkeys`)

- Tastenkürzel mit Sequenzen, Scoping, Konflikterkennung und Rebinding. Die Doku sagt: „currently in alpha and its API is still subject to change“. Quelle: https://tanstack.com/hotkeys/latest/docs/overview. `latest` ist 0.14.0 (https://registry.npmjs.org/@tanstack/react-hotkeys).
- **Verdikt: später.** Vielleicht für „/“ zum Fokussieren der Suche oder ⌘K. Im Alpha-Stadium aber nicht.

## TanStack Ranger (`@tanstack/react-ranger`)

- Hooks für Range- und Multi-Range-Slider. `latest` 0.0.5, letzter Release 2025-12-06. Quelle: https://registry.npmjs.org/@tanstack/react-ranger
- **Verdikt: nicht nötig.** Es gibt keinen Anwendungsfall. Ein Preis-Range-Filter wäre der einzige Kandidat, und Base UI hat einen eigenen Slider (**unverifiziert**, nicht geprüft).

---

## Empfohlenes Muster

Die Bausteine sind Router-Search-Params (Wahrheit für Filter, Sortierung und Seite), ein lokaler Input-State mit dem vorhandenen `useDebouncedValue` (kein Pacer), Query mit `keepPreviousData` und Table v9 im `manual`-Modus. Die Skizze nutzt die API-Namen aus den oben zitierten Docs. Die genauen Importpfade der Table-Features sind nicht einzeln gegen den Code geprüft.

```tsx
// routes/_main/offers/index.tsx
const offerSearch = z.object({
  search: z.string().optional(),
  companyIds: z.array(z.string()).optional(),
  sort: z.enum(["createdAt:desc", "createdAt:asc"]).catch("createdAt:desc"),
  page: z.number().int().min(0).catch(0),
});
export const Route = createFileRoute("/_main/offers/")({
  validateSearch: offerSearch,
  component: OfferPage,
});

// -page.tsx
const features = tableFeatures({ rowSortingFeature, rowPaginationFeature });
const PAGE_SIZE = 50;

function OfferPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  // Suchfeld: lokal tippen, debounced in die URL (Seite zurück auf 0)
  const [input, setInput] = useState(search.search ?? "");
  const debounced = useDebouncedValue(input.trim(), 250);   // vorhandener Hook
  useEffect(() => {
    if ((search.search ?? "") !== debounced) setSearch({ search: debounced || undefined, page: 0 });
  }, [debounced]);

  const { data, isPlaceholderData } = useQuery({
    ...offerQueries.list({ ...search, limit: PAGE_SIZE }),  // Query-Key = URL-State
    placeholderData: keepPreviousData,
  });

  const [field, dir] = search.sort.split(":");
  const table = useTable({
    features, columns, data: data?.items ?? [],
    manualSorting: true, manualPagination: true,
    rowCount: data?.total,                                  // Server muss total liefern (oder pageCount: -1 bei Cursor)
    state: {
      sorting: [{ id: field, desc: dir === "desc" }],
      pagination: { pageIndex: search.page, pageSize: PAGE_SIZE },
    },
    onSortingChange: (u) => { /* u -> "field:dir", setSearch({ sort, page: 0 }) */ },
    onPaginationChange: (u) => { /* u -> setSearch({ page }) */ },
  });
  // Render: table.getHeaderGroups(), table.getRowModel().rows, flexRender(...)
  // Während isPlaceholderData die Tabelle abdimmen statt Skeleton zeigen.
}
```

Ohne Table, also für Karten-Listen, gilt dasselbe Muster ohne den `useTable`-Block.

**Voraussetzungen auf der Server-Seite**, sonst bleibt das Frontend Kosmetik:
1. `orderFilterSchema` und `getAllOrders` um `search` und `sort` erweitern. Heute ignoriert der Server beides.
2. Für Tabellen mit Seitenzahlen braucht der Server `offset`/`page` plus `total` in der Antwort. Das bestehende Cursor-Paging der Angebote passt eher zu „mehr laden“ (`useInfiniteQuery`) oder zu `pageCount: -1`.
3. Kunden-Filter für Land und Sprache auf den Server verlagern. Heute filtert der Client doppelt nach (`-page.hooks.ts:61-68` und `customer-list.tsx:26-36`).
4. Die Filter-Schemas aus `@keepit/schemas` für `validateSearch` wiederverwenden. Für die URL `.catch()`-Defaults ergänzen.

**Reihenfolge:**
1. Server-Lücken schließen, URL-State, Debounce und `keepPreviousData` in einem gemeinsamen Hook oder Muster bündeln. Dafür sind keine neuen Pakete nötig.
2. Danach Table v9 für „Vorgänge“ und die Preis-Tabellen als generische `DataTable`.
3. Pacer, Virtual und Hotkeys erst bei konkretem Bedarf.

---

## Quellen

- https://tanstack.com/table/latest
- https://tanstack.com/table/latest/docs/overview
- https://tanstack.com/table/latest/docs/framework/react/guide/migrating
- https://tanstack.com/table/latest/docs/guide/client-side-vs-server-side
- https://tanstack.com/table/latest/docs/framework/react/guide/pagination
- https://tanstack.com/table/latest/docs/framework/react/guide/sorting
- https://ui.shadcn.com/docs/components/data-table
- https://tanstack.com/pacer/latest/docs/overview
- https://tanstack.com/pacer/latest/docs/framework/react/reference/index
- https://tanstack.com/pacer/latest/docs/framework/react/reference/functions/useDebouncedValue
- https://tanstack.com/router/latest/docs/framework/react/guide/search-params
- https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries
- https://tanstack.com/virtual/latest/docs/introduction
- https://tanstack.com/db/latest/docs/overview
- https://github.com/TanStack/db (README, Status-Badge)
- https://tanstack.com/hotkeys/latest/docs/overview
- npm-Registry (Versionen, Release-Daten, Abhängigkeiten, abgefragt am 2026-10-15): https://registry.npmjs.org/@tanstack/react-table, …/react-pacer, …/react-form, …/react-virtual, …/react-db, …/react-store, …/react-hotkeys, …/react-ranger

Nicht verifiziert: Bundle-Größe pro einzelnem Table-Feature, Datenvolumen in Produktion, ob Base UI einen Range-Slider hat, und die exakten Importpfade für `tableFeatures` und die Feature-Objekte.
