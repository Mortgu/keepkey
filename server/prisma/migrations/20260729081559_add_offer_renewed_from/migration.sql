-- AlterTable
ALTER TABLE "offer" ADD COLUMN     "renewedFromOfferId" TEXT;

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentTerm" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_renewedFromOfferId_fkey" FOREIGN KEY ("renewedFromOfferId") REFERENCES "offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
