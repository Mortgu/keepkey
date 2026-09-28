/*
  Warnings:

  - A unique constraint covering the columns `[invoiceId]` on the table `invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[quoteId]` on the table `offer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceId_key" ON "invoice"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "offer_quoteId_key" ON "offer"("quoteId");
