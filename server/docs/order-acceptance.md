# Bestellungen als Angebotsannahme

`Order.offerId` verweist eindeutig auf ein angenommenes Angebot. Bestellungen
speichern ausschließlich Bestellnummer, Datum, Projektangaben, Bestelldetails,
Annahmebenutzer/-zeitpunkt, Storno und technische Versions-/Dokumentdaten.
Es gibt keine OrderPosition-/OrderFlatRate-Tabellen und keine eigenen Konditionen.

Bei Annahme wird das Angebot unter demselben Advisory-Lock wie Bearbeitung und
Restore sowie einem Row-Lock gelesen. `expectedOfferVersion` muss übereinstimmen.
Annahmesperre, Snapshot und Bestellung werden in einer Transaktion gespeichert.
Eine fehlgeschlagene Bestellung sperrt daher kein Angebot. Die Angebotsversion
wird erhöht und aktuelle Angebotsdokumente werden invalidiert: Ein noch laufender
Job mit vor der Annahme geladenen Stammdaten darf nicht als aktuell finalisieren.

`Offer.acceptedSnapshot` enthält ein versioniertes, Zod-validiertes Abbild der
Konditionen, Adressdaten, Sprache und Produkt-/Vertragstexte sowie der fertigen
Angebots-Templatedaten (einschließlich Vergleichspreisen). Es enthält keine
Session-, Konto- oder Authentifizierungsdaten. Nach Annahme ist es unveränderlich.
Dokumentvorlagen selbst bleiben austauschbar; eingefroren sind die Dokumentdaten,
nicht die Vorlage oder ein binär identisches Layout. Die ausgelieferten Artefakte
bleiben in der bestehenden Dokumenthistorie.

Bestellabfragen liefern die bisherigen Konditions-/Positionsfelder als abgeleitete
Lesesicht mit. Geschrieben wird ausschließlich in die Metadaten der Bestellung.
Angebotsrabatte und Freimonate werden beim Bearbeiten nie neu berechnet.

## HTTP-Vertrag

`POST /api/orders`:

```json
{
  "id": "offer-id",
  "expectedOfferVersion": 1,
  "orderId": "AB-2026-001",
  "date": "2026-09-08",
  "projectNumber": "P-1",
  "projectDescription": "Projektbeschreibung",
  "orderDetails": "Registrierungsangaben"
}
```

Datum und Projektfelder sind optional. `id` bleibt die Angebots-ID.
`expectedOfferVersion` ist neu und verpflichtend. Der Annahmebenutzer kommt aus
der Session, niemals aus dem Request-Body.

`PATCH /api/orders/:id`:

```json
{
  "expectedVersion": 1,
  "order": {
    "orderId": "AB-2026-001",
    "date": "2026-09-08",
    "projectNumber": "P-2",
    "projectDescription": null,
    "orderDetails": null
  }
}
```

Preis-, Kunden-, Vertrags-, Positions- oder Pauschalfelder werden mit HTTP 400
abgelehnt, auch wenn sie zusätzlich zu erlaubten Feldern übermittelt werden.
Bestellrevisionen enthalten nur diese Metadaten; Restore übernimmt keine Preise.

`POST /api/orders/:id/cancel` erhält `{ "expectedVersion": 1 }`.
Stornierte Bestellungen sind nicht mehr bearbeitbar; neue Dokumentjobs werden
abgelehnt. Vorhandene Dokumente bleiben lesbar. Das Angebot bleibt gesperrt.
`DELETE /api/orders/:id` liefert 409 `ORDER_DELETE_FORBIDDEN`.
Dashboard-Umsätze schließen stornierte Bestellungen aus. Ein angenommenes Angebot
wird durch Storno nicht wieder als offen gezählt.

Client und Server verwenden die strikten Schreibschemas aus `shared/src/order.schema.ts`.
Das Formular sendet die beim Öffnen geladene Angebotsversion und schließt erst
nach erfolgreicher Annahme. Bestellungen lassen sich ausschließlich in ihren
Zusatzdaten bearbeiten oder stornieren. Angenommene Angebote sind in der Auswahl
für neue Bestellungen ausgeblendet; Bearbeitung, Löschen und Restore sind gesperrt.
Validierungs- und Konfliktfehler werden übersetzt im Dialog angezeigt.

## Migration und Prüfung

`20260908160000_order_accepts_offer` setzt eine leere Bestelltabelle voraus und
bricht andernfalls vor dem Umbau ab. Es gibt keine Altbestands-/Übergangslogik.
Die Migration enthält Datenbank-Trigger, die auch direkte Änderungen/Löschungen
angenommener Angebote und ihrer Positionen, Pauschalen und Rabatte verhindern.
Die Migration wird mit dieser Codeänderung bereitgestellt, nicht automatisch
gegen eine Entwicklungs- oder Produktionsdatenbank angewendet.

- `pnpm --filter server exec prisma validate`
- `pnpm --filter server exec tsc --noEmit`
- `pnpm --filter server test` — Unit- und PostgreSQL/WASM-Migrationstests ohne externe Dienste.
- `ORDER_TEST_DATABASE_URL=... pnpm --filter server exec vitest run src/services/order-postgres.test.ts`
  — zusätzliche echte PostgreSQL-Tests für Parallelität und Rollback. Nur eine
  explizite Testdatenbank verwenden; der Test legt darin ein isoliertes Schema an
  und entfernt ausschließlich dieses anschließend wieder.
