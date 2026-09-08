BEGIN;
-- This application has no orders yet. Abort rather than discard unexpected data.
LOCK TABLE "order" IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "order") THEN
    RAISE EXCEPTION 'Order model migration requires an empty order table';
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "offer" DROP CONSTRAINT "offer_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_contactPersonId_customerId_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_contractId_fkey";

-- DropForeignKey
ALTER TABLE "order_position" DROP CONSTRAINT "order_position_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_position" DROP CONSTRAINT "order_position_productId_fkey";

-- DropForeignKey
ALTER TABLE "order_flat_rate" DROP CONSTRAINT "order_flat_rate_flatRateId_fkey";

-- DropForeignKey
ALTER TABLE "order_flat_rate" DROP CONSTRAINT "order_flat_rate_orderId_fkey";

-- DropIndex
DROP INDEX "order_customerId_idx";

-- DropIndex
DROP INDEX "order_contactPersonId_idx";

-- DropIndex
DROP INDEX "order_employeeId_idx";

-- DropIndex
DROP INDEX "order_contractId_idx";

-- DropIndex
DROP INDEX "order_supplierId_idx";

-- AlterTable
ALTER TABLE "offer" ADD COLUMN     "acceptedAt" TIMESTAMPTZ(6),
ADD COLUMN     "acceptedSnapshot" JSONB;

-- AlterTable
ALTER TABLE "order" DROP COLUMN "contactPersonId",
DROP COLUMN "contractId",
DROP COLUMN "customerId",
DROP COLUMN "duration_months",
DROP COLUMN "employeeId",
DROP COLUMN "net_amount",
DROP COLUMN "paymentTerm",
DROP COLUMN "requestFrom",
DROP COLUMN "supplierId",
DROP COLUMN "validUntil",
ADD COLUMN     "acceptedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "acceptedById" TEXT NOT NULL,
ADD COLUMN     "cancelledAt" TIMESTAMPTZ(6);

-- DropTable
DROP TABLE "order_position";

-- DropTable
DROP TABLE "order_flat_rate";

-- CreateIndex
CREATE INDEX "order_acceptedById_idx" ON "order"("acceptedById");

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Older migration history did not create the unique index already declared in Prisma.
CREATE UNIQUE INDEX IF NOT EXISTS "order_orderId_key" ON "order"("orderId");

-- An accepted offer always carries a complete, versioned source snapshot.
ALTER TABLE "offer" ADD CONSTRAINT "offer_acceptance_snapshot_check" CHECK (
  ("acceptedAt" IS NULL AND "acceptedSnapshot" IS NULL) OR
  ("acceptedAt" IS NOT NULL AND "acceptedSnapshot" IS NOT NULL
    AND COALESCE("acceptedSnapshot"->>'schemaVersion' = '1', false)
    AND COALESCE(jsonb_typeof("acceptedSnapshot"->'source') = 'object', false)
    AND COALESCE(jsonb_typeof("acceptedSnapshot"->'offerTemplate') = 'object', false))
);

CREATE FUNCTION protect_accepted_offer() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD."acceptedAt" IS NOT NULL THEN
    IF TG_OP = 'DELETE' THEN
      RAISE EXCEPTION 'OFFER_ACCEPTED: accepted offers cannot be deleted';
    END IF;
    IF (to_jsonb(NEW) - 'documentVersion' - 'updatedAt') IS DISTINCT FROM
       (to_jsonb(OLD) - 'documentVersion' - 'updatedAt') THEN
      RAISE EXCEPTION 'OFFER_ACCEPTED: accepted offers cannot be changed';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_accepted_offer BEFORE UPDATE OR DELETE ON "offer"
  FOR EACH ROW EXECUTE FUNCTION protect_accepted_offer();

CREATE FUNCTION protect_accepted_offer_item() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE source_id text; target_id text;
BEGIN
  IF TG_OP <> 'INSERT' THEN source_id := OLD."offerId"; END IF;
  IF TG_OP <> 'DELETE' THEN target_id := NEW."offerId"; END IF;
  -- Row locks serialize child writes with acceptance, including direct SQL writes.
  PERFORM id FROM "offer" WHERE id IN (source_id, target_id) ORDER BY id FOR UPDATE;
  IF EXISTS (SELECT 1 FROM "offer" WHERE id IN (source_id, target_id) AND "acceptedAt" IS NOT NULL) THEN
    RAISE EXCEPTION 'OFFER_ACCEPTED: accepted offer items cannot be changed';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_accepted_offer_position BEFORE INSERT OR UPDATE OR DELETE ON "offer_position"
  FOR EACH ROW EXECUTE FUNCTION protect_accepted_offer_item();
CREATE TRIGGER protect_accepted_offer_flat_rate BEFORE INSERT OR UPDATE OR DELETE ON "offer_flat_rate"
  FOR EACH ROW EXECUTE FUNCTION protect_accepted_offer_item();
CREATE TRIGGER protect_accepted_offer_discount BEFORE INSERT OR UPDATE OR DELETE ON "offer_discount"
  FOR EACH ROW EXECUTE FUNCTION protect_accepted_offer_item();

CREATE FUNCTION protect_order_acceptance() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'ORDER_DELETE_FORBIDDEN: cancel orders instead';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW."offerId" IS DISTINCT FROM OLD."offerId" OR
       NEW."acceptedAt" IS DISTINCT FROM OLD."acceptedAt" OR
       NEW."acceptedById" IS DISTINCT FROM OLD."acceptedById" THEN
      RAISE EXCEPTION 'ORDER_SOURCE_IMMUTABLE: acceptance cannot be changed';
    END IF;
    IF OLD."cancelledAt" IS NOT NULL AND NEW."cancelledAt" IS DISTINCT FROM OLD."cancelledAt" THEN
      RAISE EXCEPTION 'ORDER_CANCELLED: cancellation cannot be undone';
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM "offer" WHERE id = NEW."offerId"
      AND "acceptedAt" = NEW."acceptedAt" AND "acceptedSnapshot" IS NOT NULL) THEN
    RAISE EXCEPTION 'ORDER_REQUIRES_ACCEPTED_OFFER';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_order_acceptance BEFORE INSERT OR UPDATE OR DELETE ON "order"
  FOR EACH ROW EXECUTE FUNCTION protect_order_acceptance();
COMMIT;
