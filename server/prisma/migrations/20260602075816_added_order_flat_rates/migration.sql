-- CreateTable
CREATE TABLE "order_flat_rate" (
    "id" TEXT NOT NULL,
    "flatRateId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,

    CONSTRAINT "order_flat_rate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_flat_rate" ADD CONSTRAINT "order_flat_rate_flatRateId_fkey" FOREIGN KEY ("flatRateId") REFERENCES "flat_rate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_flat_rate" ADD CONSTRAINT "order_flat_rate_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
