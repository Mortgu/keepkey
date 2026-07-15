BEGIN;

-- Existing local artifacts require a separate migration because their bytes
-- cannot be moved to object storage from inside a database migration.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "document") THEN
        RAISE EXCEPTION 'Document rows exist. Upload local artifacts to S3 before applying this migration.';
    END IF;
END $$;

DROP INDEX "document_filename_key";

ALTER TABLE "document"
    DROP COLUMN "filename",
    DROP COLUMN "basename",
    DROP COLUMN "path",
    ADD COLUMN "objectKey" TEXT NOT NULL;

CREATE UNIQUE INDEX "document_objectKey_key" ON "document"("objectKey");

ALTER TABLE "offer_document" ADD COLUMN "deletedAt" TIMESTAMPTZ(6);
ALTER TABLE "order_document" ADD COLUMN "deletedAt" TIMESTAMPTZ(6);

COMMIT;
