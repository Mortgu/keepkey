/*
  Warnings:

  - You are about to drop the column `docxReady` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `isCurrent` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `offerId` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `pdfReady` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `reservationFile` on the `offer` table. All the data in the column will be lost.
  - Added the required column `format` to the `document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentFormat" AS ENUM ('PDF', 'DOCX', 'RESERVED');

-- DropForeignKey
ALTER TABLE "document" DROP CONSTRAINT "document_offerId_fkey";

-- DropForeignKey
ALTER TABLE "document" DROP CONSTRAINT "document_orderId_fkey";

-- DropIndex
DROP INDEX "document_offerId_version_key";

-- AlterTable
ALTER TABLE "document" DROP COLUMN "docxReady",
DROP COLUMN "isCurrent",
DROP COLUMN "offerId",
DROP COLUMN "orderId",
DROP COLUMN "pdfReady",
DROP COLUMN "version",
ADD COLUMN     "format" "DocumentFormat" NOT NULL,
ADD COLUMN     "path" TEXT;

-- AlterTable
ALTER TABLE "offer" DROP COLUMN "reservationFile";

-- CreateTable
CREATE TABLE "offer_documents" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "documentId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,

    CONSTRAINT "offer_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_documents" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "documentId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "order_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offer_documents_documentId_key" ON "offer_documents"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "offer_documents_offerId_version_documentId_key" ON "offer_documents"("offerId", "version", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "order_documents_documentId_key" ON "order_documents"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "order_documents_orderId_version_documentId_key" ON "order_documents"("orderId", "version", "documentId");

-- AddForeignKey
ALTER TABLE "offer_documents" ADD CONSTRAINT "offer_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_documents" ADD CONSTRAINT "offer_documents_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_documents" ADD CONSTRAINT "order_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_documents" ADD CONSTRAINT "order_documents_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
