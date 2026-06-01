/*
  Warnings:

  - You are about to drop the column `offerId` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `task` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[taskId]` on the table `document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reservationTaskId]` on the table `offer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_offerId_fkey";

-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_orderId_fkey";

-- AlterTable
ALTER TABLE "document" ADD COLUMN     "taskId" TEXT;

-- AlterTable
ALTER TABLE "offer" ADD COLUMN     "reservationTaskId" TEXT;

-- AlterTable
ALTER TABLE "task" DROP COLUMN "offerId",
DROP COLUMN "orderId",
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "document_taskId_key" ON "document"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "offer_reservationTaskId_key" ON "offer"("reservationTaskId");

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_reservationTaskId_fkey" FOREIGN KEY ("reservationTaskId") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
