# keepkey

Domain language for the keepkey backend: offer, order, invoice, and confirmation document generation, and the commercial data behind them.

## Language

**Accepted Snapshot**:
The frozen commercial fields (customer, contract, positions, flat rates, discounts, pricing, and the rendered document template) captured the moment an offer is accepted. Once set, it overlays the live record whenever that offer, its order, invoice, or confirmation is presented or rendered, so a later rename or price change never alters a document already sent. Corresponds to the `acceptedSnapshot` Prisma field and the `CommercialSource` type.
_Avoid_: frozen offer, commercial source (as a term — use "Accepted Snapshot" for the concept, `CommercialSource` only when naming the type itself)

**Party**:
The named individual presented on a document — either the customer's contact person or the keepit employee — reduced to the same shape: salutation, first/last name, a derived full name, phone, and email. Corresponds to the `formatParty()` helper in `server/src/utils/party.ts`, shared by offer, order, and invoice document generation.
_Avoid_: person (too generic, not used elsewhere in this codebase)
