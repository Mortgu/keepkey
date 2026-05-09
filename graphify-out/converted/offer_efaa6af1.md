<!-- converted from offer.docx -->



{customer.companyName}
{customer.salutation} {customer.firstName} {customer.lastName}
{customer.street}
{customer.plz} {customer.city}









Keepit SaaS-Backup für {products.names}

Sehr geehrte(r) {customer.salutation} {customer.lastName},

hiermit senden wir Ihnen wie besprochen unser Angebot zur Einrichtung einer SaaS-Backup Lösung für Ihre {products.names} Umgebung:

{#products.grouped}
Keepit für {names}
Im Vertrag: „{contract.name}“
{#contract.features}
{.}
{/contract.features}
Vertragslaufzeit: {duration}
Zahlungsweise: im Voraus
{/products.grouped}

{#products.items}{description}{/products.items}

Insbesondere ergeben sich keine weiteren Kosten für z.B. Storage, Datenübertragung, Bereitstellung von Bandbreiten, etc. Der Preis enthält ebenfalls die Aufbewahrung der Daten in doppelter Kopie jedes Backup Images, jeweils an zwei getrennten Rechenzentrumsstandorten innerhalb Deutschlands (oder in der Schweiz, oder in Dänemark, etc.). Der Backup Storage befindet sich in der Keepit-eigenen Cloud, unabhängig von Microsoft und anderen Hyperscalern, und es handelt sich immer um Hot-Storage (drehende Festplatten) sowie einen unveränderbaren, Ransomware-sicheren Speicherplatz.

Das Datenvolumen ist unbegrenzt - sowohl für Backup, als auch für Restore. Die Lizenzierung erfolgt auf Grundlage „aktiver User Lizenzen“ (bei M365 unterteilt in Microsoft E- bzw. A-/F-Lizenzen).

Onboarding, Unterstützung bei Ersteinrichtung & Konfiguration sowie Einweisung / Schulung auf das Produkt sind in der Position 3. enthalten.



{#products.grouped}


{/products.grouped}
| A N G E B O T | A N G E B O T |
| --- | --- |
| Beleg-Nr.: | {voucherId} |
| Datum: | {date} |
| Zahlungsbedingung: | {paymentTerm} |
| Angebot gültig bis: | {validUntil} |
| Kunden-Nr.: | {customer.id} |
| Lieferanten-Nr.: | {supplierId} |
| Ihre Anfrage vom: | {requestFrom} |
| Ihr Ansprechpartner: | {customer.salutation} {customer.lastName} |
| Unser Ansprechpartner: | {employee.fullName}
{employee.phone}
{employee.email} |
| dignum GmbH • Peterhofstr. 5 • 86438 Kissing • Germany |
| --- |
| Pos. | Pos. | Artikel / Leistung | Anz. | Preis User
/ Monat | Gesamt EUR
({duration_months} Monate) |
| --- | --- | --- | --- | --- | --- |
|  |  | Keepit - Backup {names} | Keepit - Backup {names} | Keepit - Backup {names} | Keepit - Backup {names} |
|  |  | {#items}{#optional}(optional):{/}
Keepit – Tarif Backup für {name}
{table} | {quantity} | {price.unit} | {price.total}{/} |
|  |  | {#flatRates}
{flatRate.name}
{flatRate.table} | {quantity} |  | {price.total}{/} |
|  |  |  | Summe Netto EUR | Summe Netto EUR | {total} |