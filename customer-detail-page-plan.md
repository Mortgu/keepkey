# Kunden-Detail-Seite mit Angeboten, Bestellungen, Renewals

## Kontext

Die Kunden-Seite ist heute nur eine flache Liste; Angebote/Bestellungen werden auf eigenen Seiten ohne Kundenbezug erstellt. Ziel: eine Kunden-Detail-Seite (`/customers/$customerId`), auf der die Vorgänge eines Kunden sichtbar sind und Angebote, Bestellungen und Renewals direkt mit vorausgewähltem Kunden erstellt werden können. Rechnungen sind im Backend noch nicht implementiert → nur Platzhalter-Tab. Passend zum Branch `feat/osk-46-renewals` werden dabei die offenen Renewal-Enden geschlossen (DB-Verknüpfung + Submit-Fix).

**Entscheidungen (mit User abgestimmt):**
- Eine Seite mit Tabs (Angebote / Bestellungen / Rechnungen) via `FilterTabBar`, Tab als Search-Param
- Rechnungen: nur Platzhalter
- Renewals: `Offer.renewedFromOfferId` (Migration) + Modal-Fix; Anzeige als Badge im Angebote-Tab (kein eigener Tab — ein Renewal *ist* ein Angebot)
- Orders: Server-Filter `companyIds` nachrüsten (analog Offers)

## WP 0 — Prisma-Migration

[server/prisma/schema/offer.prisma](server/prisma/schema/offer.prisma), `model Offer` ergänzen:

```prisma
renewedFromOfferId String?
renewedFrom        Offer?  @relation("OfferRenewals", fields: [renewedFromOfferId], references: [id], onDelete: SetNull)
renewals           Offer[] @relation("OfferRenewals")
```

Dann in `server/`: `npx prisma migrate dev --name add_offer_renewed_from` + `npx prisma generate` (nie `db push`, Projektregel).

## WP 1 — Server

1. **Bugfix Customer-Detail-Endpoint** — [customer.route.ts:29](server/src/routes/customer.route.ts:29): zweites `router.get('/', getCustomer)` → `router.get('/:id', getCustomer)`. Ohne das funktioniert `useCustomer(id)` nicht.
2. **renewOffer verknüpft Quelle** — [offer.service.ts](server/src/services/offer.service.ts): `createOffer(input, options?: { renewedFromOfferId?: string })` (optionaler 2. Param, wird in `tx.offer.create` data gespreadet); `renewOffer` (~Z. 636) ruft `createOffer(input, { renewedFromOfferId: sourceOfferId })`. Route `POST /api/offers/:id/renew` existiert bereits.
3. **Orders-Filter** — [order.service.ts](server/src/services/order.service.ts): `getAllOrders(query?)` baut `where.customerId = { in: [...] }` aus `companyIds` (String-oder-Array-Normalisierung wie in `offer.service.ts` ~Z. 213). [order.controller.ts](server/src/controllers/order.controller.ts): `request.query` durchreichen. Keine Pagination (bleibt wie bisher).

## WP 2 — Shared Schemas (`@keepit/schemas`)

- [offer.schema.ts](shared/src/offer.schema.ts): in `offerSchema` (~Z. 139) `renewedFromOfferId: z.string().nullable().optional()` ergänzen. **Nicht** in `createOfferSchema` (Server leitet es aus dem Pfad-Param ab, kein Spoofing).
- [order.schema.ts](shared/src/order.schema.ts): `orderFilterSchema = z.object({ companyIds: z.array(z.string()).optional() })` + `OrderFilterParams` (`z.input`, benannte zod-Imports — Konvention).
- `customerSchema` **nicht** um `offers` erweitern (zirkulärer Import mit offer.schema; die Detail-Seite lädt Angebote ohnehin voll typisiert über `useOffers({ companyIds: [id] })` — das kann Offers bereits).

## WP 3 — Client-Datenschicht

1. **Orders-Filter durchfädeln** (`client/src/hooks/orders/`): `order-api.ts` `getOrders(filters = {})` mit `formatQueryString` (wie `offer-api.ts`); `order-keys.ts` `list(filters)`; `order-queries.ts`; `order-hooks.ts` `useOrders(filters = {})`. Mutations unverändert (Invalidierung über `orderKeys.lists()`-Prefix greift weiter). Bestehende Aufrufer funktionieren über Defaults.
2. **Renewal-Submit fixen**:
   - [use-renewal-form.ts](client/src/routes/_main/offers/-components/modals/renewal/hook/use-renewal-form.ts): `useCreateOffer`/`createOffer(value)` ersetzen durch `useRenewOffer()` aus [offer-mutations.ts:247](client/src/hooks/offers/offer-mutations.ts:247) → `await renewOffer({ offerId: offer.id, input: value })`. API `renewOffer(offerId, input)` existiert ungenutzt in [offer-api.ts:117](client/src/hooks/offers/offer-api.ts:117).
   - [renewal-modal.tsx:20-23](client/src/routes/_main/offers/-components/modals/renewal/renewal-modal.tsx): `handleSubmit` → `await form.handleSubmit();`, Stub-Toast `showToast.info("offers.toast.renewalStub")` entfernen (Key existiert in keiner Locale; Erfolg = Modal schließt + Liste refresht, wie beim Offer-Create). Ungenutzten `showToast`-Import aufräumen.

## WP 4 — Modal-Anpassungen (minimal)

1. **OfferModal: Kunde vorauswählen** — tote Props droppen (`customers, suppliers, users, products, contracts` werden im JSX nicht genutzt; Sub-Komponenten fetchen selbst; einziger Aufrufer [offer-list.tsx](client/src/routes/_main/offers/-components/offer-list.tsx)):
   - [offer-modal.tsx](client/src/routes/_main/offers/-components/modals/offer/offer-modal.tsx): Props → `{ closeFn, currentOffer, preselectedCustomerId? }`
   - [use-offer-form.ts](client/src/routes/_main/offers/-hooks/use-offer-form.ts): Param durchreichen an `useOfferModal`
   - [use-offer.offer-modal.ts:28](client/src/routes/_main/offers/-hooks/use-offer.offer-modal.ts:28): `const preselected = customers.find(c => c.id === preselectedCustomerId);` dann `customerId: currentOffer?.customerId || preselected?.id || customers[0]?.id || ""` und analog `contactPersonId` mit `preselected?.contactPersons[0]?.id`.
   - `offer-list.tsx`: die fünf Prop-Zeilen am `<OfferModal>`-Aufruf entfernen.
2. **OrderModal: auf Kunden scopen** — [order-modal.tsx](client/src/routes/_main/orders/-components/order-modal.tsx): Props → `{ onClose, customerId? }`; Schritt-1-Offer-Picker nutzt `useOffers(customerId ? { companyIds: [customerId] } : {})`. Bestehender Aufrufer unverändert.
3. **RenewalModal**: keine Änderung an Props (`{ offer, onClose }`) — kommt über die wiederverwendete `OfferCard` gratis mit (die besitzt den Renewal-Button + Modal bereits).
4. **Renewal-Badge** — [offer-card.tsx](client/src/routes/_main/offers/-components/card/offer-card.tsx): wenn `offer.renewedFromOfferId` gesetzt, `<Badge>`-Kennzeichnung „Verlängerung" neben der Quote-Nr. Wirkt auf Offers-Seite UND Kunden-Seite.

## WP 5 — Kunden-Detail-Seite (neu)

```
client/src/routes/_main/customers/$customerId/
  index.tsx                      → Route (validateSearch: tab enum offers|orders|invoices, default+catch "offers")
  -page.tsx                      → CustomerDetailPage
  -components/
    customer-detail-header.tsx   → Stammdaten + Ansprechpartner + Aktions-Buttons
    customer-offers-tab.tsx
    customer-orders-tab.tsx
    customer-invoices-tab.tsx    → Platzhalter
```

- **index.tsx**: `createFileRoute("/_main/customers/$customerId/")` mit `customerDetailSearchSchema` (Tab als Search-Param — Codebase-Konvention `validateSearch`, überlebt Reload, deep-linkbar). Erste dynamische Route der App; `routeTree.gen.ts` regeneriert der Vite-Plugin automatisch.
- **-page.tsx**: `Route.useParams()` + `useCustomer(customerId)` (existiert in [customer-hooks.ts](client/src/hooks/customers/customer-hooks.ts)); `PageWidth variant="none"`; Zurück-Link zu `/customers`; Loading via `PageHeaderSkeleton`/`Skeleton`; danach Header, `FilterTabBar` ([filter-tab-bar.tsx](client/src/components/filters/filter-tab-bar.tsx), Tab-Wechsel via `navigate({ search: { tab }, replace: true })`), aktiver Tab. Die Seite besitzt die Create-Modals (Konvention `useModal()` + `key={modal.key}`):
  - „Angebot erstellen" → `<OfferModal preselectedCustomerId={customerId} />`
  - „Bestellung erstellen" → `<OrderModal customerId={customerId} />`
  - Renewal: pro Angebot in der `OfferCard`, nicht page-owned.
- **customer-detail-header.tsx**: Stammdaten-Card (companyName, customerId, Adresse, email/invoiceEmail/phone, language/currency/taxRate, `formatDate(createdAt)`) im Stil von `customer-list-item.tsx`; Edit-Button mit vorhandenem `CustomerModal`; Ansprechpartner-Block (`Collapsable` + `ContactListItem` + `ContactPersonForm` aus `../-components/` — Block übernehmen, `customer-list-item.tsx` nicht refactoren).
- **customer-offers-tab.tsx**: `useOffers({ companyIds: [customerId] })` (funktioniert heute schon serverseitig); rendert `OfferCard` je Angebot → Renewal-Button, History-Drawer, Dokument-Aktionen gratis; eigenes `useModal<Offer>()` für Edit. Leerzustand „Keine Angebote." 50er-Default-Limit akzeptiert (kein Load-more vorerst).
- **customer-orders-tab.tsx**: `useOrders({ companyIds: [customerId] })`, rendert `OrderCard`. Leerzustand „Keine Bestellungen."
- **customer-invoices-tab.tsx**: statischer Hinweis „Rechnungen sind noch nicht verfügbar." — kein Fetch, kein Backend.
- **Verlinkung**: [customer-list-item.tsx](client/src/routes/_main/customers/-components/customer-list-item.tsx) — companyName/customerId-Block in `<Link to="/customers/$customerId" params>` wrappen (nicht die ganze Card; Edit/Delete-Buttons außerhalb lassen).
- **Nav-Highlight**: [navigation.tsx](client/src/components/navigation/navigation.tsx) — Kunden-`NavLink` braucht `activeOptions={{ exact: false }}` (NavLink nutzt aktuell exact:true), damit er auf der Detail-Seite aktiv bleibt.

Deutsche hardcodierte Labels — konsistent mit dem bestehenden Customers-Bereich.

## Verifikation

1. `pnpm --filter @keepit/schemas build` (shared zuerst), dann Migration (WP 0), dann Dev-Server starten.
2. `pnpm lint` + `pnpm test` (Server-Vitest) + Typecheck.
3. Manuell:
   - `/customers` → Klick auf Kunde → Detail-Seite lädt (verifiziert den `/:id`-Fix, auch per direktem URL-Reload); Nav bleibt markiert.
   - Tab-Wechsel ändert `?tab=`, überlebt Reload; ungültiges `?tab=x` fällt auf „offers" zurück.
   - „Angebot erstellen" → Kunde + erster Ansprechpartner vorausgewählt → speichern → erscheint im Angebote-Tab.
   - „Bestellung erstellen" → Schritt 1 zeigt nur Angebote dieses Kunden → erscheint im Bestellungen-Tab.
   - Renewal auf einer OfferCard → submittet wirklich (Netzwerk: `POST /api/offers/:id/renew`), Modal schließt, neues Angebot mit „Verlängerung"-Badge, `renewedFromOfferId` = Quell-Offer.
   - Offers-/Orders-Seiten unverändert funktionsfähig; `GET /api/orders?companyIds=<id>` filtert, ohne Param wie bisher.
4. Nach Abschluss: `graphify update .`

## Risiken (kurz)

- Erste dynamische Route: falls der Route-Generator zickt, Fallback flaches `$customerId.tsx` (verliert Kolokation — Verzeichnis bevorzugen).
- Wiederverwendung von `OfferCard`/`OrderCard` koppelt Customers-UI an Offers/Orders-Interna — bewusst akzeptiert (Konsistenz, keine Duplikate).
- Express-Query-Eigenheit: einzelnes `companyIds=<id>` kommt als String an → gleiche Normalisierung wie bei Offers.
- Vorbestehender Typ-Mismatch `customerSchema.orders` (rich typisiert, Server liefert bare Orders) bleibt bewusst unangetastet.
