-- AlterTable
ALTER TABLE "order" ADD COLUMN     "cancelledById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- CreateIndex
CREATE INDEX "order_cancelledById_idx" ON "order"("cancelledById");

-- CreateIndex
CREATE INDEX "order_updatedById_idx" ON "order"("updatedById");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
