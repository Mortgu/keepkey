-- Der handgeschriebene Owner-Check aus 20260715150000 kennt nur Offer und Order.
-- Jeder neue Dokumenttyp muss hier ergänzt werden, sonst scheitert das Anlegen
-- der Artefakte mit "document_exactly_one_owner_check".
ALTER TABLE "document" DROP CONSTRAINT "document_exactly_one_owner_check";
ALTER TABLE "document"
    ADD CONSTRAINT "document_exactly_one_owner_check"
        CHECK (num_nonnulls("offerDocumentId", "orderDocumentId", "confirmationDocumentId") = 1);
