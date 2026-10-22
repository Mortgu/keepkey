-- AlterTable
ALTER TABLE "confirmation_document" ADD COLUMN     "model" JSONB;

-- AlterTable
ALTER TABLE "invoice_document" ADD COLUMN     "model" JSONB;

-- AlterTable
ALTER TABLE "offer_document" ADD COLUMN     "model" JSONB;

-- AlterTable
ALTER TABLE "order_document" ADD COLUMN     "model" JSONB;
