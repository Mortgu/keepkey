BEGIN;

LOCK TABLE "document", "offer_document", "order_document"
IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "offer_document"
        WHERE ("pdfId" IS NULL) <> ("docxId" IS NULL)
    ) THEN
        RAISE EXCEPTION 'Offer documents with partial artifact links must be repaired before migration';
    END IF;

    IF EXISTS (
        SELECT 1 FROM "order_document"
        WHERE ("pdfId" IS NULL) <> ("docxId" IS NULL)
    ) THEN
        RAISE EXCEPTION 'Order documents with partial artifact links must be repaired before migration';
    END IF;

    IF EXISTS (
        SELECT 1 FROM "offer_document"
        WHERE "status" IN ('GENERATED', 'UPLOADING', 'UPLOADED')
          AND ("pdfId" IS NULL OR "docxId" IS NULL)
    ) THEN
        RAISE EXCEPTION 'Completed offer documents must have PDF and DOCX artifacts before migration';
    END IF;

    IF EXISTS (
        SELECT 1 FROM "order_document"
        WHERE "status" IN ('GENERATED', 'UPLOADING', 'UPLOADED')
          AND ("pdfId" IS NULL OR "docxId" IS NULL)
    ) THEN
        RAISE EXCEPTION 'Completed order documents must have PDF and DOCX artifacts before migration';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "offer_document" od
        JOIN "document" d ON d."id" = od."pdfId"
        WHERE d."format" <> 'PDF'
    ) OR EXISTS (
        SELECT 1
        FROM "order_document" od
        JOIN "document" d ON d."id" = od."pdfId"
        WHERE d."format" <> 'PDF'
    ) THEN
        RAISE EXCEPTION 'A pdfId references an artifact whose format is not PDF';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "offer_document" od
        JOIN "document" d ON d."id" = od."docxId"
        WHERE d."format" <> 'DOCX'
    ) OR EXISTS (
        SELECT 1
        FROM "order_document" od
        JOIN "document" d ON d."id" = od."docxId"
        WHERE d."format" <> 'DOCX'
    ) THEN
        RAISE EXCEPTION 'A docxId references an artifact whose format is not DOCX';
    END IF;

    IF EXISTS (
        SELECT "artifactId"
        FROM (
            SELECT "pdfId" AS "artifactId" FROM "offer_document" WHERE "pdfId" IS NOT NULL
            UNION ALL
            SELECT "docxId" FROM "offer_document" WHERE "docxId" IS NOT NULL
            UNION ALL
            SELECT "pdfId" FROM "order_document" WHERE "pdfId" IS NOT NULL
            UNION ALL
            SELECT "docxId" FROM "order_document" WHERE "docxId" IS NOT NULL
        ) artifact_references
        GROUP BY "artifactId"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'An artifact is linked to more than one generated document';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "document" d
        WHERE NOT EXISTS (SELECT 1 FROM "offer_document" od WHERE od."pdfId" = d."id" OR od."docxId" = d."id")
          AND NOT EXISTS (SELECT 1 FROM "order_document" od WHERE od."pdfId" = d."id" OR od."docxId" = d."id")
    ) THEN
        RAISE EXCEPTION 'Unowned document artifacts must be resolved before migration';
    END IF;
END $$;

ALTER TABLE "document"
    ADD COLUMN "offerDocumentId" TEXT,
    ADD COLUMN "orderDocumentId" TEXT;

UPDATE "document" d
SET "offerDocumentId" = od."id"
FROM "offer_document" od
WHERE d."id" = od."pdfId" OR d."id" = od."docxId";

UPDATE "document" d
SET "orderDocumentId" = od."id"
FROM "order_document" od
WHERE d."id" = od."pdfId" OR d."id" = od."docxId";

ALTER TABLE "document"
    ADD CONSTRAINT "document_offerDocumentId_fkey"
        FOREIGN KEY ("offerDocumentId") REFERENCES "offer_document"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "document_orderDocumentId_fkey"
        FOREIGN KEY ("orderDocumentId") REFERENCES "order_document"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "document_exactly_one_owner_check"
        CHECK (num_nonnulls("offerDocumentId", "orderDocumentId") = 1);

CREATE UNIQUE INDEX "document_offerDocumentId_format_key"
ON "document"("offerDocumentId", "format");

CREATE UNIQUE INDEX "document_orderDocumentId_format_key"
ON "document"("orderDocumentId", "format");

ALTER TABLE "offer_document"
    DROP CONSTRAINT "offer_document_pdfId_fkey",
    DROP CONSTRAINT "offer_document_docxId_fkey",
    DROP COLUMN "pdfId",
    DROP COLUMN "docxId";

ALTER TABLE "order_document"
    DROP CONSTRAINT "order_document_pdfId_fkey",
    DROP CONSTRAINT "order_document_docxId_fkey",
    DROP COLUMN "pdfId",
    DROP COLUMN "docxId";

COMMIT;
