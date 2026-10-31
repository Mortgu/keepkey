-- `quoteId` ist die Belegnummer des Angebots selbst, kein Fremdschlüssel — der
-- Name kollidierte mit dem FK-Namensmuster `<model>Id` (z.B. `Document.offerId`),
-- das überall sonst einen Verweis auf `Offer.id` meint. Umbenannt in `quoteNumber`.
ALTER TABLE "offer" RENAME COLUMN "quoteId" TO "quoteNumber";
ALTER INDEX "offer_quoteId_key" RENAME TO "offer_quoteNumber_key";
