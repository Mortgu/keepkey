-- CreateTable
CREATE TABLE "order_position" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "offerPositionId" TEXT NOT NULL,
    "purchase_eur_user_month" INTEGER NOT NULL,
    "purchase_total_cents" INTEGER NOT NULL,
    "purchase_discount_cents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "order_position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_position_orderId_offerPositionId_key" ON "order_position"("orderId", "offerPositionId");

-- AddForeignKey
ALTER TABLE "order_position" ADD CONSTRAINT "order_position_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

