ALTER TABLE "offer_revision"
ADD COLUMN "snapshotVersion" INTEGER NOT NULL DEFAULT 1;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "offer_revision"
        GROUP BY "offerId", "version"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Cannot add unique offer revision versions: duplicate (offerId, version) rows require manual audit.';
    END IF;
END $$;

CREATE UNIQUE INDEX "offer_revision_offerId_version_key"
ON "offer_revision"("offerId", "version");

ALTER TABLE "offer_document"
ADD COLUMN "sourceVersion" INTEGER;

ALTER TABLE "order"
ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "order_document"
ADD COLUMN "sourceVersion" INTEGER;

CREATE TABLE "order_revision" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshotVersion" INTEGER NOT NULL DEFAULT 1,
    "snapshot" JSONB NOT NULL,
    "orderId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_revision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "order_revision_orderId_version_key"
ON "order_revision"("orderId", "version");

ALTER TABLE "order_revision"
ADD CONSTRAINT "order_revision_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_revision"
ADD CONSTRAINT "order_revision_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
