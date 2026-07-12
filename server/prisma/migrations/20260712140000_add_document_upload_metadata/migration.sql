-- AlterTable
ALTER TABLE "document"
ADD COLUMN     "sha256" TEXT,
ADD COLUMN     "remotePath" TEXT,
ADD COLUMN     "remoteEtag" TEXT;

-- Preserve remote locations for documents uploaded before local/remote metadata was separated.
UPDATE "document"
SET "remotePath" = "filename"
WHERE "uploadedAt" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "document_remotePath_key" ON "document"("remotePath");

-- AlterTable
ALTER TABLE "offer_document" ADD COLUMN     "uploadToken" TEXT;

-- AlterTable
ALTER TABLE "order_document" ADD COLUMN     "uploadToken" TEXT;
