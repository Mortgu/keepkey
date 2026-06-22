/*
  Warnings:

  - The values [RESERVED] on the enum `DocumentFormat` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `displayName` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `taskId` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `isReserved` on the `offer` table. All the data in the column will be lost.
  - You are about to drop the column `reservationTaskId` on the `offer` table. All the data in the column will be lost.
  - You are about to drop the `offer_documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_documents` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[filename]` on the table `document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `basename` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `document` table without a default value. This is not possible if the table is not empty.
  - Made the column `path` on table `document` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocumentFormat_new" AS ENUM ('PDF', 'DOCX');
ALTER TABLE "document" ALTER COLUMN "format" TYPE "DocumentFormat_new" USING ("format"::text::"DocumentFormat_new");
ALTER TYPE "DocumentFormat" RENAME TO "DocumentFormat_old";
ALTER TYPE "DocumentFormat_new" RENAME TO "DocumentFormat";
DROP TYPE "public"."DocumentFormat_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "document" DROP CONSTRAINT "document_taskId_fkey";

-- DropForeignKey
ALTER TABLE "offer" DROP CONSTRAINT "offer_reservationTaskId_fkey";

-- DropForeignKey
ALTER TABLE "offer_documents" DROP CONSTRAINT "offer_documents_documentId_fkey";

-- DropForeignKey
ALTER TABLE "offer_documents" DROP CONSTRAINT "offer_documents_offerId_fkey";

-- DropForeignKey
ALTER TABLE "order_documents" DROP CONSTRAINT "order_documents_documentId_fkey";

-- DropForeignKey
ALTER TABLE "order_documents" DROP CONSTRAINT "order_documents_orderId_fkey";

-- DropIndex
DROP INDEX "document_taskId_key";

-- DropIndex
DROP INDEX "offer_reservationTaskId_key";

-- AlterTable
ALTER TABLE "document" DROP COLUMN "displayName",
DROP COLUMN "status",
DROP COLUMN "taskId",
ADD COLUMN     "basename" TEXT NOT NULL,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL,
ALTER COLUMN "path" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "offer" DROP COLUMN "isReserved",
DROP COLUMN "reservationTaskId";

-- DropTable
DROP TABLE "offer_documents";

-- DropTable
DROP TABLE "order_documents";

-- CreateTable
CREATE TABLE "offer_document" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "status" "DocumentStatus" NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "offerId" TEXT NOT NULL,
    "pdfId" TEXT,
    "docxId" TEXT,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "offer_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_document" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "status" "DocumentStatus" NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT NOT NULL,
    "pdfId" TEXT,
    "docxId" TEXT,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "order_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offer_document_pdfId_key" ON "offer_document"("pdfId");

-- CreateIndex
CREATE UNIQUE INDEX "offer_document_docxId_key" ON "offer_document"("docxId");

-- CreateIndex
CREATE UNIQUE INDEX "order_document_pdfId_key" ON "order_document"("pdfId");

-- CreateIndex
CREATE UNIQUE INDEX "order_document_docxId_key" ON "order_document"("docxId");

-- CreateIndex
CREATE UNIQUE INDEX "document_filename_key" ON "document"("filename");

-- AddForeignKey
ALTER TABLE "offer_document" ADD CONSTRAINT "offer_document_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_document" ADD CONSTRAINT "offer_document_pdfId_fkey" FOREIGN KEY ("pdfId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_document" ADD CONSTRAINT "offer_document_docxId_fkey" FOREIGN KEY ("docxId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_document" ADD CONSTRAINT "offer_document_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_document" ADD CONSTRAINT "order_document_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_document" ADD CONSTRAINT "order_document_pdfId_fkey" FOREIGN KEY ("pdfId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_document" ADD CONSTRAINT "order_document_docxId_fkey" FOREIGN KEY ("docxId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_document" ADD CONSTRAINT "order_document_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
