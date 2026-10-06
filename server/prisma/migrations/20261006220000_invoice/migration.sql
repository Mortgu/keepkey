-- DropForeignKey
ALTER TABLE "invoice" DROP CONSTRAINT "invoice_supplierId_fkey";

-- DropIndex
DROP INDEX "invoice_orderId_idx";

-- DropIndex
DROP INDEX "invoice_supplierId_idx";

-- AlterTable
ALTER TABLE "document" ADD COLUMN     "invoiceDocumentId" TEXT;

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "paymentTerm",
DROP COLUMN "projectId",
DROP COLUMN "supplierId",
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- CreateTable
CREATE TABLE "invoice_document" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "sourceVersion" INTEGER,
    "status" "DocumentStatus" NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "uploadToken" TEXT,
    "invoiceId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "invoice_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoice_document_taskId_key" ON "invoice_document"("taskId");

-- CreateIndex
CREATE INDEX "invoice_document_invoiceId_idx" ON "invoice_document"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "document_invoiceDocumentId_format_key" ON "document"("invoiceDocumentId", "format");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_orderId_key" ON "invoice"("orderId");

-- CreateIndex
CREATE INDEX "invoice_createdById_idx" ON "invoice"("createdById");

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_invoiceDocumentId_fkey" FOREIGN KEY ("invoiceDocumentId") REFERENCES "invoice_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_document" ADD CONSTRAINT "invoice_document_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_document" ADD CONSTRAINT "invoice_document_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Owner-Check um die Rechnung erweitern (siehe 20261006210000).
ALTER TABLE "document" DROP CONSTRAINT "document_exactly_one_owner_check";
ALTER TABLE "document"
    ADD CONSTRAINT "document_exactly_one_owner_check"
        CHECK (num_nonnulls("offerDocumentId", "orderDocumentId", "confirmationDocumentId", "invoiceDocumentId") = 1);
