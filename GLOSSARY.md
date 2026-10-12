# keepkey

Domain language for the keepkey backend: offer, order, invoice, and confirmation document generation, and the commercial data behind them.

## Language

**Accepted Snapshot**:
The frozen commercial fields (customer, contract, positions, flat rates, discounts, pricing, and the rendered document template) captured the moment an offer is accepted. Once set, it overlays the live record whenever that offer, its order, invoice, or confirmation is presented or rendered, so a later rename or price change never alters a document already sent. Corresponds to the `acceptedSnapshot` Prisma field and the `CommercialSource` type.
_Avoid_: frozen offer, commercial source (as a term — use "Accepted Snapshot" for the concept, `CommercialSource` only when naming the type itself)
