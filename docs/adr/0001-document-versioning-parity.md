---
status: accepted
---

# All four document types keep full version history; nothing is deleted automatically

Confirmation and Invoice documents currently work differently from Offer and Order documents: a new generation request deletes the previous document (files included) and replaces it, so there is no history, even though `version`, `sourceVersion`, and `isCurrent` columns already exist unused on both tables. We decided to bring all four document types to parity: every regeneration creates a new version and keeps the old ones; a document is only ever removed by explicit user action (the existing `deleteDocument` path), never automatically as a side effect of regenerating.

Confirmation and Invoice records have no mutable source field — `taxRate`, the cent amounts, and the business ID are fixed at creation and documented as unchangeable afterward — so there is nothing for them to go stale against. Their generation adapters report `sourceVersion: null` always, which reuses the staleness check's existing `!= null` guard rather than adding a second code path. Only Offer and Order, which have a mutable `version` that can change between a generation request and its render, can ever refuse a generation as stale. Regeneration itself is never blocked for any type; a request for a type that already has a generation in flight reuses that task instead of erroring or double-generating.

## Considered Options

- Keep versioning optional per adapter (a `versioning?` field present only for Offer/Order) — rejected because it leaves Confirmation/Invoice structurally different from Offer/Order for no domain reason, and the `sourceVersion: null` approach already gets the same effect through machinery that exists today.

## Consequences

- Schema migration: add `documentVersion Int @default(0)` to `Confirmation` and `Invoice` (mirroring `Offer`/`Order`), and `@@unique([confirmationId, version])` / `@@unique([invoiceId, version])` on their document tables. Additive only — existing rows are already `version: 0` and unique per parent.
- `requestConfirmationGeneration`/`requestInvoiceGeneration` move onto the same `requestGeneration` adapter `requestOfferGeneration`/`requestOrderGeneration` already use, and drop their delete-previous-document step.
- The explicit, user-triggered delete path in `documents.service.ts` is unaffected — this decision only removes the *automatic* delete that used to happen on regeneration.
