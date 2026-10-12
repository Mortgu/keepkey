-- AlterTable
ALTER TABLE "confirmation" ADD COLUMN     "documentVersion" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "documentVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "confirmation_document_confirmationId_version_key" ON "confirmation_document"("confirmationId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_document_invoiceId_version_key" ON "invoice_document"("invoiceId", "version");

