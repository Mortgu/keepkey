-- CreateEnum
CREATE TYPE "TariffVersionReason" AS ENUM ('MANUAL', 'OFFER', 'RESTORE');

-- AlterTable
ALTER TABLE "offer_position" ADD COLUMN     "tariffVersionId" TEXT;

-- CreateTable
CREATE TABLE "tariff_customer_price" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT,
    "duration" INTEGER NOT NULL,
    "min_quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tariff_customer_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariff_version" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshotVersion" INTEGER NOT NULL DEFAULT 1,
    "hash" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "reason" "TariffVersionReason" NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tariff_version_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tariff_customer_price_tariffId_customerId_productId_duratio_key" ON "tariff_customer_price"("tariffId", "customerId", "productId", "duration", "min_quantity");

-- CreateIndex
CREATE INDEX "tariff_version_tariffId_hash_idx" ON "tariff_version"("tariffId", "hash");

-- CreateIndex
CREATE UNIQUE INDEX "tariff_version_tariffId_version_key" ON "tariff_version"("tariffId", "version");

-- DataMigration: Kundenpreise von cellId auf die stabilen Koordinaten
-- (duration, min_quantity) umziehen. Muss vor dem DROP der Quelltabelle laufen.
INSERT INTO "tariff_customer_price"
    ("id", "tariffId", "customerId", "productId", "duration", "min_quantity", "price", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    c."tariffId",
    tcc."customerId",
    tcc."productId",
    col."duration",
    r."min_quantity",
    tcc."price",
    tcc."createdAt",
    tcc."updatedAt"
FROM "tariff_cell_customer" tcc
JOIN "tariff_cell"   c   ON c."id"   = tcc."cellId"
JOIN "tariff_column" col ON col."id" = c."columnId"
JOIN "tariff_row"    r   ON r."id"   = c."rowId"
ON CONFLICT DO NOTHING;

-- DropForeignKey
ALTER TABLE "tariff_cell_customer" DROP CONSTRAINT "tariff_cell_customer_cellId_fkey";

-- DropForeignKey
ALTER TABLE "tariff_cell_customer" DROP CONSTRAINT "tariff_cell_customer_customerId_fkey";

-- DropForeignKey
ALTER TABLE "tariff_cell_customer" DROP CONSTRAINT "tariff_cell_customer_productId_fkey";

-- DropTable
DROP TABLE "tariff_cell_customer";

-- DropTable
-- Die Altdaten sind wegen des kaputten (productId, contractId)-Keys keinem
-- Tarif verlaesslich zuzuordnen und werden bewusst nicht uebernommen.
DROP TABLE "tariff_history";

-- AddForeignKey
ALTER TABLE "offer_position" ADD CONSTRAINT "offer_position_tariffVersionId_fkey" FOREIGN KEY ("tariffVersionId") REFERENCES "tariff_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_customer_price" ADD CONSTRAINT "tariff_customer_price_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_customer_price" ADD CONSTRAINT "tariff_customer_price_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_customer_price" ADD CONSTRAINT "tariff_customer_price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_version" ADD CONSTRAINT "tariff_version_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "tariff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_version" ADD CONSTRAINT "tariff_version_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
