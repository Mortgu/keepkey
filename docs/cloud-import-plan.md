# Plan: Cloud-Import — Bestandsdokumente erkennen und als Angebote übernehmen

## Context

In der Nextcloud liegen Angebote/Rechnungen aus der Zeit vor keepit bzw. aus manueller Arbeit. Sie sind für das System unsichtbar: kein Eintrag, keine Suche, keine Verknüpfung. Ziel ist ein Import, der solche Dateien automatisiert findet, Inhalte extrahiert und daraus nach menschlicher Bestätigung echte Offers anlegt.

**Kernprinzip: Kandidaten statt Vollautomatik.** Erkennung aus Dokumenten ist probabilistisch; ein falsch angelegtes Angebot mit falschem Kunden kostet mehr als ein manueller Klick. Die Automatik erzeugt daher nie direkt Offers, sondern `ImportCandidate`-Einträge mit extrahierten Daten und Match-Vorschlägen. Die Bestätigung im UI ruft die **bestehenden** Services (`createOffer`) auf, damit Pricing und Validierung identisch zur normalen Anlage laufen.

**MVP-Scope (mit User abgestimmt):** nur `.docx`, nur Angebote. PDFs werden als Kandidat erfasst, aber ohne Inhaltsextraktion (Ordner-/Dateinamen-Heuristik, Positionen manuell).

Stack-relevant: Express 5 + Prisma 7 (Postgres), BullMQ-Worker mit eigener Pipeline-Abstraktion, Nextcloud/WebDAV, S3-Artifact-Store, `@keepit/schemas` (Zod v4) als geteilte Typquelle, Client mit TanStack Router/Query/Form.

## Verifizierte Fakten (aus dem Code)

- **docx-Extraktion braucht keine neue Dependency:** `pizzip` ist bereits Abhängigkeit (via `docxtemplater`). Eine .docx ist ein ZIP; `word/document.xml` enthält Positionen als Tabellenzeilen (`<w:tr>`/`<w:tc>`/`<w:t>`) — strukturiert auslesbar, nicht nur als Textklumpen. Dateien, die das eigene System aus `server/assets/templates/offer.docx` erzeugt hat, haben eine bekannte Tabellenstruktur.
- **Fuzzy-Matching fehlt bisher:** `server/src/services/search.service.ts` nutzt nur `contains` (ILIKE/Substring). Für „Produktname aus Dokument → Produkt in DB" reicht das nicht („Keepit Backup M365" findet „Keepit Microsoft 365 Backup" nicht). Es gibt **keine** `pg_trgm`-Extension in den Migrationen — muss angelegt werden.
- `ProductTranslation` hat `@@index([language, name])`, aber keinen Trigram-Index (`server/prisma/schema/product.prisma:18`).
- **Harter Constraint:** `OfferPosition` hat Pflicht-FKs auf `productId` und `contractId` (`server/prisma/schema/offer.prisma:67`). Eine Position ohne zugeordnetes Produkt ist nicht speicherbar → die Nutzerauswahl ist zwingender Teil des Imports, nicht optional.
- **Dedupe-Anker vorhanden:** `DocumentArtifact.remotePath` ist `@unique` und `remoteEtag` existiert (`server/prisma/schema/document.prisma:15`) → bereits verlinkte Cloud-Dateien sind erkennbar.
- **Pipeline-Abstraktion wiederverwendbar:** `server/src/pipelines/pipeline.ts` (`PipelineStage<T>` + `runPipeline`), Muster in `pipelines/offer/stages.ts`; Handler-Muster in `server/src/workers/handlers/offer-handler.ts`; Queue in `server/src/workers/task-queue.ts` (Retry/Backoff bereits konfiguriert).
- **Verzeichnis-Zugriff vorhanden:** `getCachedDirectoryContents()` (60s-Cache) und `findFilesById()` in `server/src/lib/nextcloud.ts`; `OFFER_DIRECTORIES` in `server/src/services/nextcloud.service.ts` (`offer_pdf`, `offer_original`).
- Bestehende Namenskonvention der Cloud-Dateien: `findFilesById()` matcht auf Präfix `` `${id}_` `` — Bestandsdateien ohne dieses Präfix sind genau die Import-Kandidaten.
- `TaskTarget`/`TaskType` (`server/prisma/schema/task.prisma`) kennen noch kein `IMPORT`.
- Serialisierungs-Muster im Controller existiert: `productSchema.parse()` in `server/src/controllers/product.controller.ts:23`; Services annotieren mit `z.input<typeof schema>` (Server-Sicht, Dates noch `Date`).

## Architektur

Vier Stufen, jede idempotent und einzeln wiederholbar:

1. **Scan** — Verzeichnisse durchgehen, unbekannte Dateien als Kandidat anlegen
2. **Extraktion** — docx-Tabellen auslesen (Kunde, Belegnummer, Datum, Positionen)
3. **Matching** — extrahierte Namen per Trigram-Ähnlichkeit gegen DB, Top-N mit Score
4. **Review & Übernahme** — Nutzer bestätigt/korrigiert, dann `createOffer()` + Datei verlinken

## Teil A — Datenmodell

1. **`server/prisma/schema/import.prisma`** (neu):

```prisma
model ImportCandidate {
  id           String   @id @default(cuid())
  remotePath   String   @unique   // Dedupe-Anker, analog DocumentArtifact.remotePath
  remoteEtag   String              // Re-Extraktion nur bei Änderung
  basename     String
  sourceLabel  String              // "offer_original" | "offer_pdf"

  detectedType ImportType   @default(UNKNOWN)
  status       ImportStatus @default(PENDING)

  extracted    Json?        // importExtractionSchema-Payload
  extractError String?

  matchedCustomerId String?
  createdOfferId    String?

  createdAt DateTime @default(now()) @db.Timestamptz(6)
  updatedAt DateTime @updatedAt @db.Timestamptz(6)

  @@map("import_candidate")
}

enum ImportType   { OFFER ORDER INVOICE UNKNOWN }
enum ImportStatus { PENDING EXTRACTED NEEDS_REVIEW IMPORTED REJECTED DUPLICATE }
```

2. **`server/prisma/schema/task.prisma`**: `TaskType` um `IMPORT`, `TaskTarget` um `IMPORT` erweitern.

3. **Migration** (`npx prisma migrate dev`, kein `db push` — hand-geschriebenes SQL ist Teil des Schemas):

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX product_translation_name_trgm  ON product_translation  USING GIN (name gin_trgm_ops);
CREATE INDEX contract_translation_name_trgm ON contract_translation USING GIN (name gin_trgm_ops);
CREATE INDEX flat_rate_translation_name_trgm ON flat_rate_translation USING GIN (name gin_trgm_ops);
CREATE INDEX customer_company_name_trgm     ON customer             USING GIN ("companyName" gin_trgm_ops);
```

Danach `npx prisma generate`.

## Teil B — shared (`shared/src/import.schema.ts`, neu)

Konventionen beachten (siehe `shared/src/product.schema.ts`): named zod-Import, `isoDateTime` aus `common.ts` für Timestamps, `.nullable()` für Prisma-Optionals, in shared `z.infer` exportieren (Wire-Format).

4. Schemas:
   - `importExtractionSchema` — `quoteId`, `customerName`, `date`, `positions: [{ rawName, quantity, totalCents, rawLine }]`
   - `matchSuggestionSchema` — `{ id, label, score }`, generisch für Produkt/Contract/Flatrate/Kunde
   - `importCandidateSchema` / `importCandidateListSchema`
   - `confirmImportSchema` — gewählte `customerId` + pro Position `{ productId, contractId, quantity, totalCents }`
5. Export in `shared/src/index.ts`, danach `npm run build` in `shared/`.

## Teil C — Server

6. **`server/src/services/match.service.ts`** (neu) — Kern des Matchings, generisch:
   `matchProducts(term, limit = 5)`, `matchContracts`, `matchFlatrates`, `matchCustomers`.
   Implementierung per `prisma.$queryRaw`: `WHERE name % $term` (nutzt GIN-Index) + `ORDER BY similarity(name, $term) DESC LIMIT n`, Rückgabe inkl. Score. `search.service.ts` bleibt vorerst unangetastet, kann später auf denselben Unterbau umgestellt werden.

7. **`server/src/lib/docx-extract.ts`** (neu) — `word/document.xml` per `pizzip` lesen; Tabellenzeilen zu Zellen-Arrays; Fließtext separat für Kopfdaten (Belegnummer/Datum/Kundenname) per Regex, Belegnummern-Muster aus `getNextQuoteId()` (`offer.service.ts`) ableiten.

8. **`server/src/services/import-scan.service.ts`** (neu) — iteriert `OFFER_DIRECTORIES` über `getCachedDirectoryContents()`; überspringt, was bereits als `DocumentArtifact.remotePath` verlinkt oder als `ImportCandidate.remotePath` bekannt ist (geänderter etag → Re-Extraktion); legt Kandidaten an, erzeugt je einen Task und enqueued auf `taskQueue`.

9. **`server/src/pipelines/import/`** (neu) — auf Basis von `pipeline.ts`, analog `pipelines/offer/stages.ts`:
   `download` → `extract` → `match` → `persist` (Status `NEEDS_REVIEW`).
   Handler `server/src/workers/handlers/import-handler.ts` analog `offer-handler.ts`, Registrierung in `task-worker.ts`.

10. **`server/src/services/import.service.ts`** (neu):
    - `confirmCandidate(id, input)` → ruft **unverändertes** `createOffer()` aus `offer.service.ts`, verlinkt danach die Cloud-Datei als `OfferDocument` + `DocumentArtifact` (Datei nach S3 via `storeDocumentArtifacts()`, `remotePath`/`remoteEtag` setzen), Kandidat auf `IMPORTED` + `createdOfferId`.
    - `rejectCandidate(id)`

11. **`server/src/routes/import.route.ts`** (neu, registriert in `routes/router.ts`), Stil wie `product.route.ts` mit `validate()`-Middleware:
    ```
    POST   /api/imports/scan
    GET    /api/imports/candidates
    GET    /api/imports/candidates/:id     (inkl. Match-Vorschlägen)
    POST   /api/imports/candidates/:id/confirm
    POST   /api/imports/candidates/:id/reject
    ```
    Controller serialisieren mit `importCandidateSchema.parse()`.

## Teil D — Client

12. Neue Route `client/src/routes/_main/settings/imports/` + Eintrag in `settings-sidebar.tsx`.
13. **Liste** — bestehende `ListPage`/`ListItemRow`-Komponenten, Status-Badge, Button „Cloud scannen".
14. **Review-Modal** — `ModalDialog` + `SingleDropdown`; pro Position ein Dropdown, vorbelegt mit dem besten Match (Score über Schwelle), Optionen = Top-N-Vorschläge, Freitextsuche als Fallback.
15. Hooks/Query-Keys nach Muster `client/src/hooks/products/`; i18n-Keys in beiden Sprachdateien.

## Bewusst nicht im MVP

PDF-Textextraktion, OCR, LLM-gestützte Extraktion, Orders/Invoices, Auto-Confirm bei hoher Confidence, Repeatable-Job für den Scan (zunächst manuell per Button). Positionen ohne Produkt-Treffer werden im Review übersprungen und protokolliert; Produktanlage aus dem Import heraus ist Folgearbeit.

**Hinweis zu Rechnungen (Folgephase):** `Invoice` verlangt Pflicht-FKs auf `orderId` **und** `supplierId` (`server/prisma/schema/invoice.prisma`). Eine Alt-Rechnung ohne zugehörige Order im System ist damit nicht speicherbar — es braucht vorher entweder ein Schema-Zugeständnis (Relationen optional) oder einen Order-Import als Vorbedingung.

## Reihenfolge

A(1→3) → B(4→5) → C(6→7 mit Tests, dann 8→11) → D(12→15) → Verifikation.

## Verifikation

1. `npx prisma migrate dev` + `npx prisma generate`; in psql prüfen:
   `SELECT similarity('Keepit Backup M365', name), name FROM product_translation ORDER BY 1 DESC LIMIT 5;` → plausible Rangfolge.
2. Unit-Tests für `docx-extract.ts` gegen ein aus `server/assets/templates/offer.docx` generiertes Dokument (Vitest-Muster: `server/src/lib/document.test.ts`) — Positionszeilen mit Name/Menge/Betrag.
3. Unit-Test für `import-scan.service.ts` mit gemocktem WebDAV (Muster: `server/src/lib/nextcloud-document-store.test.ts`): zweiter Scan legt keine Duplikate an, verlinkte Dateien werden übersprungen.
4. E2E lokal: Test-docx in den Offer-Ordner → Scan auslösen → Kandidat `NEEDS_REVIEW` → im Modal bestätigen → Offer existiert, Dokument hängt dran, Kandidat `IMPORTED`, zweiter Scan erzeugt ihn nicht erneut.
5. `npx tsc --noEmit` (server), `npx tsc -b` (client), `npm test` (server). Bekannt und unabhängig: 2 vorbestehende Failures in `server/src/workers/task-lifecycle.test.ts`.
6. `graphify update .`
