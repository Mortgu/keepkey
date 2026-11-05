-- Fasst offer_document/order_document/confirmation_document/invoice_document in
-- einer Tabelle document_record zusammen (Issue #72/#73). Von Prisma generiertes
-- DDL, von Hand umsortiert: erst neue Tabelle anlegen, Daten kopieren und die
-- Artefakte umhängen, danach die Altspalten/-tabellen löschen.

-- CreateEnum
CREATE TYPE "DocumentOwnerType" AS ENUM ('OFFER', 'ORDER', 'CONFIRMATION', 'INVOICE');

-- CreateTable
CREATE TABLE "document_record" (
    "id" TEXT NOT NULL,
    "type" "DocumentOwnerType" NOT NULL,
    "displayName" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "sourceVersion" INTEGER,
    "status" "DocumentStatus" NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "uploadToken" TEXT,
    "model" JSONB,
    "offerId" TEXT,
    "orderId" TEXT,
    "confirmationId" TEXT,
    "invoiceId" TEXT,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "document_record_pkey" PRIMARY KEY ("id")
);

-- Handgeschrieben: genau der zu "type" passende Eltern-FK ist gesetzt. Anders als
-- der alte document_exactly_one_owner_check (num_nonnulls = 1) bindet dieser den
-- Diskriminator an die richtige Spalte. Ein neuer Dokumenttyp braucht hier eine
-- weitere Zeile — sonst nichts.
ALTER TABLE "document_record"
    ADD CONSTRAINT "document_record_type_owner_check"
        CHECK (
            ("type" = 'OFFER'::"DocumentOwnerType")        = ("offerId" IS NOT NULL) AND
            ("type" = 'ORDER'::"DocumentOwnerType")        = ("orderId" IS NOT NULL) AND
            ("type" = 'CONFIRMATION'::"DocumentOwnerType") = ("confirmationId" IS NOT NULL) AND
            ("type" = 'INVOICE'::"DocumentOwnerType")      = ("invoiceId" IS NOT NULL)
        );

-- CreateIndex
CREATE UNIQUE INDEX "document_record_taskId_key" ON "document_record"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "document_record_offerId_version_key" ON "document_record"("offerId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "document_record_orderId_version_key" ON "document_record"("orderId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "document_record_confirmationId_version_key" ON "document_record"("confirmationId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "document_record_invoiceId_version_key" ON "document_record"("invoiceId", "version");

-- AddForeignKey
ALTER TABLE "document_record" ADD CONSTRAINT "document_record_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_record" ADD CONSTRAINT "document_record_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_record" ADD CONSTRAINT "document_record_confirmationId_fkey" FOREIGN KEY ("confirmationId") REFERENCES "confirmation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_record" ADD CONSTRAINT "document_record_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_record" ADD CONSTRAINT "document_record_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Handgeschrieben: alle Zeilen der vier Alttabellen übernehmen. Die cuid-IDs sind
-- global eindeutig und bleiben erhalten, damit die Artefakte unverändert darauf
-- zeigen können.
INSERT INTO "document_record" ("id", "type", "displayName", "version", "sourceVersion", "status", "isCurrent", "error", "uploadToken", "model", "offerId", "taskId", "createdAt", "updatedAt", "deletedAt")
SELECT "id", 'OFFER', "displayName", "version", "sourceVersion", "status", "isCurrent", "error", "uploadToken", "model", "offerId", "taskId", "createdAt", "updatedAt", "deletedAt"
FROM "offer_document";

INSERT INTO "document_record" ("id", "type", "displayName", "version", "sourceVersion", "status", "isCurrent", "error", "uploadToken", "model", "orderId", "taskId", "createdAt", "updatedAt", "deletedAt")
SELECT "id", 'ORDER', "displayName", "version", "sourceVersion", "status", "isCurrent", "error", "uploadToken", "model", "orderId", "taskId", "createdAt", "updatedAt", "deletedAt"
FROM "order_document";

INSERT INTO "document_record" ("id", "type", "displayName", "version", "sourceVersion", "status", "isCurrent", "error", "uploadToken", "model", "confirmationId", "taskId", "createdAt", "updatedAt", "deletedAt")
SELECT "id", 'CONFIRMATION', "displayName", "version", "sourceVersion", "status", "isCurrent", "error", "uploadToken", "model", "confirmationId", "taskId", "createdAt", "updatedAt", "deletedAt"
FROM "confirmation_document";

INSERT INTO "document_record" ("id", "type", "displayName", "version", "sourceVersion", "status", "isCurrent", "error", "uploadToken", "model", "invoiceId", "taskId", "createdAt", "updatedAt", "deletedAt")
SELECT "id", 'INVOICE', "displayName", "version", "sourceVersion", "status", "isCurrent", "error", "uploadToken", "model", "invoiceId", "taskId", "createdAt", "updatedAt", "deletedAt"
FROM "invoice_document";

-- Handgeschrieben: Artefakte auf die neue Tabelle umhängen. Der alte Owner-Check
-- garantiert genau einen gesetzten Alt-FK, COALESCE trifft also immer den richtigen.
ALTER TABLE "document" ADD COLUMN "documentId" TEXT;
UPDATE "document"
SET "documentId" = COALESCE("offerDocumentId", "orderDocumentId", "confirmationDocumentId", "invoiceDocumentId");
ALTER TABLE "document" ALTER COLUMN "documentId" SET NOT NULL;

-- Handgeschrieben: der alte Owner-Check entfällt ersatzlos (würde mit den Spalten
-- ohnehin fallen, hier explizit).
ALTER TABLE "document" DROP CONSTRAINT "document_exactly_one_owner_check";

-- DropForeignKey
ALTER TABLE "confirmation_document" DROP CONSTRAINT "confirmation_document_confirmationId_fkey";

-- DropForeignKey
ALTER TABLE "confirmation_document" DROP CONSTRAINT "confirmation_document_taskId_fkey";

-- DropForeignKey
ALTER TABLE "document" DROP CONSTRAINT "document_confirmationDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "document" DROP CONSTRAINT "document_invoiceDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "document" DROP CONSTRAINT "document_offerDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "document" DROP CONSTRAINT "document_orderDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "invoice_document" DROP CONSTRAINT "invoice_document_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "invoice_document" DROP CONSTRAINT "invoice_document_taskId_fkey";

-- DropForeignKey
ALTER TABLE "offer_document" DROP CONSTRAINT "offer_document_offerId_fkey";

-- DropForeignKey
ALTER TABLE "offer_document" DROP CONSTRAINT "offer_document_taskId_fkey";

-- DropForeignKey
ALTER TABLE "order_document" DROP CONSTRAINT "order_document_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_document" DROP CONSTRAINT "order_document_taskId_fkey";

-- DropIndex
DROP INDEX "document_confirmationDocumentId_format_key";

-- DropIndex
DROP INDEX "document_invoiceDocumentId_format_key";

-- DropIndex
DROP INDEX "document_offerDocumentId_format_key";

-- DropIndex
DROP INDEX "document_orderDocumentId_format_key";

-- AlterTable
ALTER TABLE "document" DROP COLUMN "confirmationDocumentId",
DROP COLUMN "invoiceDocumentId",
DROP COLUMN "offerDocumentId",
DROP COLUMN "orderDocumentId";

-- DropTable
DROP TABLE "confirmation_document";

-- DropTable
DROP TABLE "invoice_document";

-- DropTable
DROP TABLE "offer_document";

-- DropTable
DROP TABLE "order_document";

-- CreateIndex
CREATE UNIQUE INDEX "document_documentId_format_key" ON "document"("documentId", "format");

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;
