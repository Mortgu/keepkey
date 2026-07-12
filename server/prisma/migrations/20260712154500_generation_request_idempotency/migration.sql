BEGIN;

-- Prevent writes by the old application between preflight, counter backfill and index creation.
LOCK TABLE "offer_document", "order_document", "offer", "order"
IN SHARE ROW EXCLUSIVE MODE;

-- Fail with actionable diagnostics instead of partially applying constraints to inconsistent history.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "offer_document" GROUP BY "offerId", "version" HAVING COUNT(*) > 1
    ) THEN RAISE EXCEPTION 'Duplicate offer document versions must be resolved before migration';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "order_document" GROUP BY "orderId", "version" HAVING COUNT(*) > 1
    ) THEN RAISE EXCEPTION 'Duplicate order document versions must be resolved before migration';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "offer_document" GROUP BY "taskId" HAVING COUNT(*) > 1
    ) THEN RAISE EXCEPTION 'Offer tasks linked to multiple documents must be resolved before migration';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "order_document" GROUP BY "taskId" HAVING COUNT(*) > 1
    ) THEN RAISE EXCEPTION 'Order tasks linked to multiple documents must be resolved before migration';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "offer_document" WHERE "status" IN ('PENDING', 'PROCESSING') GROUP BY "offerId" HAVING COUNT(*) > 1
    ) THEN RAISE EXCEPTION 'Multiple active offer generations must be resolved before migration';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "order_document" WHERE "status" IN ('PENDING', 'PROCESSING') GROUP BY "orderId" HAVING COUNT(*) > 1
    ) THEN RAISE EXCEPTION 'Multiple active order generations must be resolved before migration';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "offer_document" WHERE "isCurrent" = true GROUP BY "offerId" HAVING COUNT(*) > 1
    ) THEN RAISE EXCEPTION 'Multiple current offer documents must be resolved before migration';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "order_document" WHERE "isCurrent" = true GROUP BY "orderId" HAVING COUNT(*) > 1
    ) THEN RAISE EXCEPTION 'Multiple current order documents must be resolved before migration';
    END IF;
END $$;

-- Persist monotonic version counters so deleting history never reuses a version.
ALTER TABLE "offer" ADD COLUMN "documentVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "order" ADD COLUMN "documentVersion" INTEGER NOT NULL DEFAULT 0;

UPDATE "offer" o
SET "documentVersion" = COALESCE((
    SELECT MAX(d."version") FROM "offer_document" d WHERE d."offerId" = o."id"
), 0);

UPDATE "order" o
SET "documentVersion" = COALESCE((
    SELECT MAX(d."version") FROM "order_document" d WHERE d."orderId" = o."id"
), 0);

-- Keep counters monotonic while old application instances may still insert documents.
CREATE FUNCTION "sync_offer_document_version"() RETURNS trigger AS $$
BEGIN
    UPDATE "offer"
    SET "documentVersion" = GREATEST("documentVersion", NEW."version")
    WHERE "id" = NEW."offerId";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "offer_document_version_counter"
AFTER INSERT ON "offer_document"
FOR EACH ROW EXECUTE FUNCTION "sync_offer_document_version"();

CREATE FUNCTION "sync_order_document_version"() RETURNS trigger AS $$
BEGIN
    UPDATE "order"
    SET "documentVersion" = GREATEST("documentVersion", NEW."version")
    WHERE "id" = NEW."orderId";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "order_document_version_counter"
AFTER INSERT ON "order_document"
FOR EACH ROW EXECUTE FUNCTION "sync_order_document_version"();

-- CreateIndex
CREATE UNIQUE INDEX "offer_document_offerId_version_key" ON "offer_document"("offerId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "offer_document_taskId_key" ON "offer_document"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "order_document_orderId_version_key" ON "order_document"("orderId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "order_document_taskId_key" ON "order_document"("taskId");

-- Only one generation may be queued or processing per parent.
CREATE UNIQUE INDEX "offer_document_active_generation_key"
ON "offer_document"("offerId")
WHERE "status" IN ('PENDING', 'PROCESSING');

CREATE UNIQUE INDEX "order_document_active_generation_key"
ON "order_document"("orderId")
WHERE "status" IN ('PENDING', 'PROCESSING');

-- Only one successfully selected document may be current per parent.
CREATE UNIQUE INDEX "offer_document_current_key"
ON "offer_document"("offerId")
WHERE "isCurrent" = true;

CREATE UNIQUE INDEX "order_document_current_key"
ON "order_document"("orderId")
WHERE "isCurrent" = true;

COMMIT;
