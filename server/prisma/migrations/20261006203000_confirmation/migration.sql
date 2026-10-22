-- AlterEnum
ALTER TYPE "TaskTarget" ADD VALUE 'CONFIRMATION';

-- AlterTable
ALTER TABLE "document" ADD COLUMN     "confirmationDocumentId" TEXT;

-- CreateTable
CREATE TABLE "confirmation" (
    "id" TEXT NOT NULL,
    "confirmationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "confirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confirmation_document" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "sourceVersion" INTEGER,
    "status" "DocumentStatus" NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "uploadToken" TEXT,
    "confirmationId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "confirmation_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "confirmation_confirmationId_key" ON "confirmation"("confirmationId");

-- CreateIndex
CREATE UNIQUE INDEX "confirmation_orderId_key" ON "confirmation"("orderId");

-- CreateIndex
CREATE INDEX "confirmation_createdById_idx" ON "confirmation"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "confirmation_document_taskId_key" ON "confirmation_document"("taskId");

-- CreateIndex
CREATE INDEX "confirmation_document_confirmationId_idx" ON "confirmation_document"("confirmationId");

-- CreateIndex
CREATE UNIQUE INDEX "document_confirmationDocumentId_format_key" ON "document"("confirmationDocumentId", "format");

-- AddForeignKey
ALTER TABLE "confirmation" ADD CONSTRAINT "confirmation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmation" ADD CONSTRAINT "confirmation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmation_document" ADD CONSTRAINT "confirmation_document_confirmationId_fkey" FOREIGN KEY ("confirmationId") REFERENCES "confirmation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmation_document" ADD CONSTRAINT "confirmation_document_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_confirmationDocumentId_fkey" FOREIGN KEY ("confirmationDocumentId") REFERENCES "confirmation_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

