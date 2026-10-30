# API-Routen für Angebot, Bestellung, Auftragsbestätigung und Rechnung

Frage: Im Server haben Confirmation und Invoice keine oder nur teilweise eigene Routes. Die Dokument-Generierung für Confirmations wird über `/api/orders` gestartet. Ist eine Aufteilung in `/api/offer`, `/api/order`, `/api/confirmation` und `/api/invoice` sinnvoll?

Geprüfter Stand: Branch `xml_test`, HEAD `00312778`, dazu die uncommittete Löschung von `server/src/routes/confirmation.route.ts`. Am Quellcode wurde nichts geändert.

## TL;DR

- **Die URLs sind im Kern schon richtig modelliert.** Eine Confirmation und eine Invoice gibt es genau einmal je Bestellung (`orderId String @unique`), und ohne Bestellung können sie nicht existieren. Deshalb sind `/api/orders/:orderId/confirmation` und `/api/orders/:orderId/invoice` als Singleton-Sub-Ressourcen passend. Dass die AB-Generierung „über /api/orders“ läuft, ist kein Strukturfehler. Es bildet das Datenmodell ab.
- **Das eigentliche Problem liegt im Code, nicht in den URLs.** Alle Confirmation- und Invoice-Endpunkte sind in `order.route.ts` registriert, obwohl es eigene Controller und Services gibt. Die Invoice ist auf zwei Router verteilt (Liste unter `/invoices`, alles andere unter `/orders`). Die Datei `confirmation.route.ts` war immer leer und wurde nie gemountet.
- **Empfehlung:** Die URLs bleiben stabil. Confirmation und Invoice bekommen je einen eigenen Router mit `mergeParams: true`, gemountet unter `/orders/:orderId/confirmation` und `/orders/:orderId/invoice`. `/api/invoices` bleibt die Collection für die Liste. Auf dem Client ändert sich dadurch nichts. Dazu kommen ein paar Konsistenz-Fixes (Param-Namen, Status-Codes, Response-Form).
- **Top-Level `/api/confirmations/:id` und `/api/invoices/:id` erst einführen, wenn die 1:1-Beziehung fällt**, etwa durch mehrere Rechnungen je Bestellung (Teil-, Storno- oder Korrekturrechnung). Dann wird aus `/orders/:orderId/invoice` die Collection `/orders/:orderId/invoices`.
- Singular-Pfade wie `/api/offer` oder `/api/order` widersprechen der Repo-Konvention: Alle 18 Collections sind im Plural gemountet.

---

## 1. Ist-Zustand

### 1.1 Mounting

Alle Router werden in `server/src/routes/router.ts` unter einem gemeinsamen Präfix eingehängt, alle mit `requireSession` und alle im Plural:

| Mount | Router | Quelle |
|---|---|---|
| `/offers` | `offer.route.ts` | `server/src/routes/router.ts:33` |
| `/orders` | `order.route.ts` | `server/src/routes/router.ts:42` |
| `/invoices` | `invoice.route.ts` | `server/src/routes/router.ts:43` (unter dem Kommentar `/* /api/orders */`) |
| `/documents` | `document.route.ts` | `server/src/routes/router.ts:67` |
| *(nichts)* | `confirmation.route.ts` | wird nicht importiert |

Die übrigen Mounts (`/products`, `/suppliers`, `/users`, `/contracts`, `/customers`, `/flatrates`, `/tasks`, `/persons`, `/tariffs`, `/templates`, `/cloud`, `/integrations`, `/search`, `/dashboard`) stehen in `router.ts:27-79`. Sie zeigen dieselbe Konvention: Plural-Collections, Sub-Ressourcen verschachtelt, z. B. `/customers/:id/contacts/:contactId` in `server/src/routes/customer.route.ts:45-54`.

### 1.2 Was es mit `confirmation.route.ts` auf sich hat

- Die Datei wurde in Commit `565e78d3` („AI written Order Confirmation generation“) als **leere Datei** angelegt (Blob `e69de29b`, 0 Byte), zusammen mit einer ebenfalls leeren `invoice.route.ts`. Im selben Commit kamen die Confirmation-Routen direkt in `order.route.ts` (`git show 565e78d3 -- server/src/routes/`).
- `invoice.route.ts` wurde später in `eb14c2bf` („invoice generation“) gefüllt, allerdings nur mit der Liste. `confirmation.route.ts` blieb leer (`git cat-file -s HEAD:server/src/routes/confirmation.route.ts` liefert `0`).
- Auf dem Branch `experimental_backend` (Commit `11be7ce4`, „moved files to new structure test“, kein Vorfahre von HEAD) wurde die leere Datei nach `server/src/modules/confirmations/confirmation.route.ts` verschoben und ist dort immer noch 0 Byte groß. Die Routen bleiben auch dort in `modules/orders/order.route.ts:29-47`.
- Die Löschung im Working Tree entfernt also nur eine tote Platzhalterdatei. Funktional ändert sie nichts.

### 1.3 Endpunkte

**Angebot**, `server/src/routes/offer.route.ts`, Controller `offer.controller.ts`, Services unter `services/offer/`:

| Methode | Pfad | Handler | Quelle |
|---|---|---|---|
| GET | `/api/offers` | `getOffers` | `offer.route.ts:32` |
| GET | `/api/offers/:id` | `getOfferById` | `offer.route.ts:35` |
| POST | `/api/offers` | `createOffer` | `offer.route.ts:38` |
| PATCH | `/api/offers/:id` | `updateOffer` | `offer.route.ts:41` |
| DELETE | `/api/offers/:id` | `deleteOffer` | `offer.route.ts:44` |
| POST | `/api/offers/:id/renew` | `renewOffer` | `offer.route.ts:47` |
| POST | `/api/offers/:id/extend` | `extendOffer` | `offer.route.ts:50` |
| GET | `/api/offers/:offerId/positions/:positionId/extension-price` | `getExtensionPrice` | `offer.route.ts:55-60` |
| POST | `/api/offers/:id/documents` | `enqueueGeneration` → `requestOfferGeneration` | `offer.route.ts:65`, `services/offer/offer-documents.ts:6` |

**Bestellung**, `server/src/routes/order.route.ts`, Controller `order.controller.ts`, Service `order.service.ts`:

| Methode | Pfad | Handler | Quelle |
|---|---|---|---|
| GET | `/api/orders` | `getAllOrders` | `order.route.ts:31` |
| GET | `/api/orders/next-number` | `getNextOrderNumber` | `order.route.ts:33` |
| GET | `/api/orders/:orderId` | `getOrderById` | `order.route.ts:35` |
| POST | `/api/orders/:orderId/documents` | `generateOrderDocument` → `requestOrderGeneration` | `order.route.ts:37-41`, `services/order.service.ts:187-201` |
| POST | `/api/orders` | `createOrder` und danach `createOrderTask` (erzeugt sofort das Bestelldokument) | `order.route.ts:65`, `controllers/order.controller.ts:25-40`, `services/order.service.ts:183-185` |
| PATCH | `/api/orders/:orderId` | `updateOrder` | `order.route.ts:67-72` |
| POST | `/api/orders/:orderId/cancel` | `cancelOrder` | `order.route.ts:74-78` |
| DELETE | `/api/orders/:id` | `deleteOrderById` (wirft immer 409 `ORDER_DELETE_FORBIDDEN`) | `order.route.ts:80`, `services/order.service.ts:203-214` |

**Auftragsbestätigung**, registriert in `order.route.ts`, Controller `confirmation.controller.ts`, Service `confirmation.service.ts`:

| Methode | Pfad | Handler | Quelle |
|---|---|---|---|
| GET | `/api/orders/:orderId/confirmation` | `getConfirmation` | `order.route.ts:44`, `controllers/confirmation.controller.ts:4-7` |
| POST | `/api/orders/:orderId/confirmation` | `createConfirmation` (legt an und **stößt sofort die Generierung an**) | `order.route.ts:45-50`, `services/confirmation.service.ts:24-55` (Generierung in Z. 53) |
| POST | `/api/orders/:orderId/confirmation/documents` | `regenerateConfirmation` → `requestConfirmationGeneration` | `order.route.ts:51`, `services/confirmation.service.ts:57-61` |
| DELETE | `/api/orders/:orderId/confirmation` | `deleteConfirmation` (nur ohne aktives Dokument, sonst 409) | `order.route.ts:52`, `services/confirmation.service.ts:68-83` |

**Rechnung**, aufgeteilt auf `invoice.route.ts` und `order.route.ts`, Controller `invoice.controller.ts`, Service `invoice.service.ts`:

| Methode | Pfad | Handler | Quelle |
|---|---|---|---|
| GET | `/api/invoices` | `getAllInvoices` (Filter: `search`, `customerIds`) | `invoice.route.ts:9`, `shared/src/invoice.schema.ts:67-70` |
| GET | `/api/orders/:orderId/invoice` | `getInvoice` | `order.route.ts:55` |
| POST | `/api/orders/:orderId/invoice` | `createInvoice` (legt an und generiert) | `order.route.ts:56-61`, `services/invoice.service.ts:48` |
| POST | `/api/orders/:orderId/invoice/documents` | `regenerateInvoice` | `order.route.ts:62`, `services/invoice.service.ts:87` |
| DELETE | `/api/orders/:orderId/invoice` | `deleteInvoice` | `order.route.ts:63`, `services/invoice.service.ts:98` |

In `invoice.route.ts:7` steht dazu der Kommentar: „Anlegen und Neu-Erzeugen hängen an der Bestellung: /api/orders/:orderId/invoice“. Die Aufteilung ist also bewusst so gewählt.

**Dokumente, typübergreifend**, `server/src/routes/document.route.ts`. Nach der Generierung werden alle vier Dokumenttypen über eine gemeinsame Ressource `/api/documents/:type/:documentId` verwaltet: umbenennen, löschen, Nextcloud-Upload, Resync, Artefakt-Download, Ersetzen und Adopt (`document.route.ts:26-82`). Dabei ist `type` einer der Werte `"offer" | "order" | "confirmation" | "invoice"` (`shared/src/document.schema.ts:43`).

### 1.4 Wo die Dokument-Generierung ausgelöst wird

Alle vier Typen laufen durch denselben Adapter `requestGeneration` in `server/src/services/document-generation-request.service.ts:26-49`. Der Adapter nimmt einen Advisory Lock, dedupliziert laufende Tasks, legt einen `Task` mit `TaskTarget` und eine neue Dokumentversion an und reiht den Task ein.

| Typ | Auslöser (HTTP) | Request-Funktion | Quelle |
|---|---|---|---|
| Offer | `POST /offers/:id/documents` | `requestOfferGeneration` | `document-generation-request.service.ts:51-91` |
| Order | `POST /orders` (implizit), `POST /orders/:orderId/documents` | `requestOrderGeneration` | `…:93-125` |
| Confirmation | `POST /orders/:orderId/confirmation` (implizit), `POST …/confirmation/documents` | `requestConfirmationGeneration` | `…:132-169` |
| Invoice | `POST /orders/:orderId/invoice` (implizit), `POST …/invoice/documents` | `requestInvoiceGeneration` | `…:175-212` |

`TaskTarget` kennt `OFFER, ORDER, RENEWAL, INVOICE, CONFIRMATION` (`server/prisma/schema/task.prisma:8-14`). Laut ADR 0001 behalten alle vier Dokumenttypen ihre volle Versionshistorie. Confirmation und Invoice liefern dabei immer `sourceVersion: null`, weil ihre Konditionen unveränderlich sind (`docs/adr/0001-document-versioning-parity.md`).

### 1.5 Datenmodell: eigene Entität oder Zustand der Bestellung?

Confirmation und Invoice sind **eigene Tabellen mit eigenem Lebenszyklus**, hängen aber **1:1 und existenzabhängig** an der Bestellung:

- `Order` hat genau ein Angebot (`offerId String @unique`) und höchstens eine Confirmation und eine Invoice (`confirmation Confirmation?`, `invoice Invoice?`): `server/prisma/schema/order.prisma:162-188`.
- `Confirmation.orderId String @unique` mit `onDelete: Restrict`, dazu eine eigene Nummer `confirmationId @unique`, eine eigene Steuer und Beträge, ein eigenes `documentVersion` und eigene `ConfirmationDocument[]`: `server/prisma/schema/confirmation.prisma:5-35`.
- `Invoice.orderId String @unique`, ebenfalls `Restrict`. Dazu kommt ein denormalisiertes `customerId`, „damit die Kundenseite ihre Rechnungen ohne Umweg über Order → Offer findet“: `server/prisma/schema/invoice.prisma:76-118`. Daraus erklärt sich, warum es überhaupt `/api/invoices` als Liste gibt.
- Der Schema-Kommentar zur Rechnung sagt ausdrücklich „genau eine je Bestellung“, mit Verweis auf § 14 UStG und GoBD für die Eindeutigkeit der Nummer (`invoice.prisma:76-78`).
- Die Bestellung selbst ist laut Schema die Bestellung **an den Zulieferer**, mit Einkaufspreisen je Position (`order.prisma:158-161`). Das ist relevant, weil in der Frage „Auftrag“ steht. Im `GLOSSARY.md` gibt es bisher keine Einträge für Offer, Order, Confirmation oder Invoice. Es definiert nur „Accepted Snapshot“ und „Party“ (`GLOSSARY.md:7-13`). Das ist eine Lücke für `/domain-modeling`.

Fazit: Fachlich sind Confirmation und Invoice keine eigenständigen Aggregate, die man ohne Bestellung adressieren würde. Sie sind abhängige 1:1-Kinder mit eigener Identität. Das ist genau der Fall, für den eine verschachtelte Singleton-Ressource passt.

### 1.6 Client-Aufrufer

| Datei | Endpunkte | Quelle |
|---|---|---|
| `client/src/hooks/offers/offer-api.ts` | `/api/offers…`, `/api/offers/:id/documents`, `/renew`, `/extend` | Z. 18, 23, 28, 34, 40, 45, 55, 61 |
| `client/src/hooks/pricing/pricing-api.ts` | `/api/offers/:offerId/positions/:positionId/extension-price` | Z. 29 |
| `client/src/hooks/orders/order-api.ts` | `/api/orders…`, `/next-number`, `/cancel`, `/:orderId/documents` | Z. 8, 11, 14, 17, 33, 36, 42 |
| `client/src/hooks/confirmations/confirmation-api.ts` | `/api/orders/:orderId/confirmation` (GET, POST, DELETE), `…/documents` | Z. 5, 8, 14, 17 |
| `client/src/hooks/invoices/invoice-api.ts` | `/api/orders/:orderId/invoice` (GET, POST, DELETE), `…/documents`, `/api/invoices` | Z. 6, 9, 15, 18, 21 |
| `client/src/hooks/documents/document-api.ts` | `/api/documents/:type/:documentId/…` | Z. 12-107 |
| `client/src/hooks/orders/order-api.test.ts` | prüft die URLs `/api/orders` und `/api/orders/order-id/cancel` | Z. 22, 51 |

Die Hooks adressieren Confirmation und Invoice **über die `orderId`**, z. B. `getConfirmationByOrder(orderId)` in `confirmation-api.ts:4` und `useInvoice(orderId)` mit dem Query-Key `invoiceKeys.byOrder(orderId)` in `client/src/hooks/invoices/invoice-hooks.ts:8-16`. In der UI werden sie hier verwendet:

- `client/src/routes/_main/orders/-components/card/confirmation-section.tsx`
- `…/card/invoice-section.tsx`
- `…/card/order-card.tsx`
- `client/src/routes/_main/offers/-components/card/offer-card.tsx`
- `client/src/routes/_main/customers/$customerId/vorgang/$flowId/-page.tsx` und `…/-components/flow-detail-view.tsx`

### 1.7 Inkonsistenzen, die beim Lesen auffallen

1. **Routing und Code-Struktur passen nicht zusammen.** Confirmation und Invoice haben eigene Controller und Services (`controllers/confirmation.controller.ts`, `controllers/invoice.controller.ts`), ihre Routen stehen aber in `order.route.ts:43-63`. Die Invoice ist zusätzlich auf zwei Router verteilt (`invoice.route.ts:9` und `order.route.ts:55-63`).
2. **Param-Namen.** In `order.route.ts` wird überall `:orderId` verwendet, nur DELETE nimmt `:id` mit `idParamsSchema` (`order.route.ts:80`). Bei den Offers ist es `:id`, bei den Positions dagegen `:offerId` (`offer.route.ts:35, 55`).
3. **Response-Form der Generierung.** `POST /orders/:orderId/documents` liefert `{ taskId }` (`controllers/order.controller.ts:42-45`). Offer, Confirmation und Invoice liefern den ganzen `Task` (`confirmation.controller.ts:18-21`, `invoice.controller.ts:24-27`, und `offer-api.ts:45` erwartet `Task`).
4. **Status-Codes.** `POST /orders` legt eine Ressource an, antwortet aber mit 200 statt 201 (`order.controller.ts:39`). Confirmation und Invoice antworten beim Anlegen korrekt mit 201 (`confirmation.controller.ts:15`, `invoice.controller.ts:20`). `DELETE /orders/:id` antwortet mit 200 und JSON, die anderen DELETEs mit 204.
5. **Kommentar.** `/invoices` steht in `router.ts:41-43` unter dem Kommentar `/* /api/orders */`.

---

## 2. Bewertung

### 2.1 Was die Spezifikationen sagen

- HTTP schreibt keine URL-Struktur vor. Laut RFC 9110 ist das Ziel eines Requests eine Ressource, die über eine URI identifiziert wird: „The target of an HTTP request is called a "resource".“ und „Most resources are identified by a Uniform Resource Identifier (URI)“ (RFC 9110 §3.1, https://www.rfc-editor.org/rfc/rfc9110#section-3.1). Ob man `/orders/:id/invoice` oder `/invoices/:id` wählt, ist also eine Designentscheidung und keine Frage der Konformität.
- Der Pfad ist nach RFC 3986 hierarchisch: „The path component contains data, usually organized in hierarchical form“ (§3.3), und „components listed in order of decreasing significance from left to right“ (§1.2.3), https://www.rfc-editor.org/rfc/rfc3986#section-3.3. Eine existenzabhängige 1:1-Kindressource unter dem Elternpfad abzubilden, nutzt genau diese Hierarchie.
- POST ist für ressourcenspezifische Verarbeitung gedacht, unter anderem „Creating a new resource that has yet to be identified by the origin server“ und „Providing a block of data … to a data-handling process“. Bei einer Neuanlage „SHOULD send a 201 (Created) response containing a Location header field“ (RFC 9110 §9.3.3, https://www.rfc-editor.org/rfc/rfc9110#section-9.3.3). Daraus folgt:
  - `POST …/confirmation` mit 201 ist korrekt. Ein `Location`-Header fehlt bisher.
  - `POST …/documents` legt eine neue Dokumentversion an, ist also ebenfalls Neuanlage und kein reines „Action“-Verb. Der Name ist sauber. 200 und Task-Body sind vertretbar, 201 oder 202 wären präziser.
  - `POST /orders` sollte 201 liefern.
- DELETE „requests that the origin server remove the association between the target resource and its current functionality“ (RFC 9110 §9.3.5, https://www.rfc-editor.org/rfc/rfc9110#section-9.3.5). `DELETE /orders/:orderId/confirmation` trifft die Singleton-Ressource damit eindeutig.

### 2.2 Was Express 5 hergibt

Das Repo nutzt `express ^5.2.1` (`server/package.json:43`).

- Router lassen sich unter beliebigen Pfaden mounten: „You can then use a router for a particular root URL in this way separating your routes into files“ (https://expressjs.com/en/5x/api/router/).
- Für verschachtelte Router mit Parametern im Mount-Pfad gibt es die Option `mergeParams`: „Preserve the `req.params` values from the parent router. If the parent and the child have conflicting param names, the child's value takes precedence.“ Der Default ist `false` (gleiche Quelle). Ein eigener `confirmation.route.ts` unter `/orders/:orderId/confirmation` braucht also `Router({ mergeParams: true })`, sonst ist `req.params.orderId` leer.
- Die Reihenfolge zählt: „The order in which you define middleware with `router.use()` is very important. They are invoked sequentially“ (gleiche Quelle). Die verschachtelten Mounts sollten deshalb vor `/orders` stehen. Das ist nicht zwingend, weil `orderRouter` diese Pfade nach dem Umbau nicht mehr matcht, macht die Absicht aber explizit.
- Dass `requireSession` mehrfach gemountet wird, ist laut Doku unkritisch, hat aber eine Nebenwirkung: Middleware „may run for other routers if its routes match“ (gleiche Quelle). Jeder Mount in `router.ts` hängt `requireSession` selbst an, die Session-Prüfung würde für diese Pfade also zweimal laufen. Das ist nur eine harmlose Doppelprüfung.

### 2.3 Optionen

**A. Flache Top-Level-Ressourcen** (`/api/confirmations/:id`, `/api/invoices/:id`, Anlage über `POST /api/confirmations { orderId }`)

- Vorteil: symmetrisch zu Offers und Orders. Jede Fachentität hat ihren eigenen Router-Präfix.
- Nachteil: Der Client kennt heute nur die `orderId` und adressiert alles darüber (`confirmation-api.ts:4-17`, `invoice-api.ts:5-18`, `invoice-keys.byOrder`). Er bräuchte zusätzlich die Confirmation- oder Invoice-`id`. Außerdem bildet die 1:1-Invariante (`orderId @unique`) eine flache Ressource schlechter ab: Ein `POST /confirmations` mit `orderId` im Body kann scheitern, weil schon eine existiert (409 `CONFIRMATION_EXISTS`, `confirmation.service.ts:33`). Unter der Bestellung ist dagegen schon im Pfad klar, dass es nur eine geben kann.
- Blast Radius: `confirmation-api.ts`, `invoice-api.ts`, `confirmation-hooks.ts`, `invoice-hooks.ts` und `invoice-keys.ts`, wahrscheinlich auch die Sections und Flow-Ansichten, die heute nur die `orderId` durchreichen (§1.6). Auf dem Server ändern sich Services und Controller von `findUnique({ where: { orderId } })` zu `id`.

**B. Verschachtelt bleiben, Code sauber trennen** (empfohlen)

- Die URLs bleiben unverändert. `confirmation.route.ts` und `invoice.route.ts` bekommen die Endpunkte und werden mit `mergeParams` unter `/orders/:orderId/confirmation` bzw. `/orders/:orderId/invoice` gemountet. `/api/invoices` bleibt die Collection für die Rechnungsliste. Fachlich ist das eine Abfrage über alle Bestellungen hinweg, ihr eigener Präfix ist also berechtigt.
- Vorteil: Jede Fachentität hat eine eigene Route-Datei, wie gewünscht. Die REST-Struktur bildet das 1:1-Datenmodell ab, und der Client merkt nichts.
- Blast Radius: `server/src/routes/router.ts`, `order.route.ts`, `invoice.route.ts` und `confirmation.route.ts` (die Datei wird wieder angelegt statt gelöscht). Im Client: nichts.

**C. Hybrid: verschachtelt anlegen, flach lesen** (`POST /orders/:orderId/invoices`, dazu `GET /invoices/:id`)

- Das ist erst sinnvoll, wenn es mehrere Rechnungen je Bestellung gibt. Solange `orderId @unique` gilt, entstehen damit zwei URIs für dieselbe Ressource, ohne dass es einen Bedarf dafür gibt.

### 2.4 Wann man umbauen sollte

Die einzige Stelle, an der sich die Modellierung ändern müsste, ist die Kardinalität. Kommen mehrere Rechnungen je Bestellung, etwa Teilrechnungen oder eine Storno- bzw. Korrekturrechnung, die die ursprüngliche Rechnung nicht verändert, dann fällt `Invoice.orderId @unique` (`invoice.prisma:92`). Dann ist Option C richtig: `/orders/:orderId/invoices` als Collection plus `/invoices/:id` als kanonische Einzelressource. Das betrifft eine Schema-Migration und alle Invoice-Hooks im Client. Für diesen Fall sollte man ein ADR schreiben, statt die URLs jetzt schon vorsorglich umzubauen.

---

## 3. Empfehlung und Routen-Tabelle

1. **Keine Umbenennung auf Singular.** Alle Mounts sind Plural (`router.ts:27-79`). `/api/offer` oder `/api/order` würden diese Konvention brechen und jede Client-URL ändern.
2. **Option B umsetzen:** eigene Router für Confirmation und Invoice, URLs stabil.
3. **Nebenbei vereinheitlichen:** `DELETE /orders/:orderId` statt `:id`. `POST /orders` liefert 201. Alle `…/documents`-Endpunkte geben denselben Body zurück, entweder überall `Task` oder überall `{ taskId }`. Dabei muss `generateOrderDocument` in `client/src/hooks/orders/order-api.ts:41-42` mit angepasst werden. Den Kommentar in `router.ts:41` korrigieren.
4. **Glossar ergänzen:** Offer, Order (Bestellung an den Zulieferer, nicht „Auftrag“), Confirmation (AB) und Invoice, jeweils mit der Kardinalität 1:1 zur Bestellung (siehe §1.5).

Vorgeschlagene Routen-Tabelle (Zielzustand, die URLs sind identisch mit heute):

| Methode | Pfad | Router-Datei | Bemerkung |
|---|---|---|---|
| GET/POST | `/api/offers` | `offer.route.ts` | unverändert |
| GET/PATCH/DELETE | `/api/offers/:id` | `offer.route.ts` | unverändert |
| POST | `/api/offers/:id/renew`, `/extend` | `offer.route.ts` | unverändert |
| POST | `/api/offers/:id/documents` | `offer.route.ts` | unverändert |
| GET/POST | `/api/orders` | `order.route.ts` | POST → 201 |
| GET | `/api/orders/next-number` | `order.route.ts` | vor `/:orderId` lassen |
| GET/PATCH/DELETE | `/api/orders/:orderId` | `order.route.ts` | DELETE auf `:orderId` umstellen |
| POST | `/api/orders/:orderId/cancel` | `order.route.ts` | unverändert |
| POST | `/api/orders/:orderId/documents` | `order.route.ts` | Response-Form angleichen |
| GET/POST/DELETE | `/api/orders/:orderId/confirmation` | **`confirmation.route.ts`** (`mergeParams`) | nur die Datei ist neu |
| POST | `/api/orders/:orderId/confirmation/documents` | **`confirmation.route.ts`** | nur die Datei ist neu |
| GET/POST/DELETE | `/api/orders/:orderId/invoice` | **`invoice.order.route.ts`** oder ein zweiter Router in `invoice.route.ts` (`mergeParams`) | nur die Datei ist neu |
| POST | `/api/orders/:orderId/invoice/documents` | wie oben | nur die Datei ist neu |
| GET | `/api/invoices` | `invoice.route.ts` | Collection über alle Bestellungen |
| … | `/api/documents/:type/:documentId/…` | `document.route.ts` | bleibt die typübergreifende Dokumentverwaltung |

Skizze für das Mounting in `router.ts`:

```ts
router.use("/orders/:orderId/confirmation", requireSession, confirmationRouter); // Router({ mergeParams: true })
router.use("/orders/:orderId/invoice", requireSession, orderInvoiceRouter);      // Router({ mergeParams: true })
router.use("/orders", requireSession, orderRouter);
router.use("/invoices", requireSession, invoiceRouter);
```

Betroffene Dateien bei Option B:

- Server: `server/src/routes/router.ts`, `server/src/routes/order.route.ts`, `server/src/routes/invoice.route.ts` und `server/src/routes/confirmation.route.ts` (neu befüllen, die uncommittete Löschung also nicht übernehmen).
- Client: keine, solange die URLs gleich bleiben. Ausnahme ist Punkt 3: Wird die Response-Form angeglichen, ist zusätzlich `client/src/hooks/orders/order-api.ts` betroffen.
