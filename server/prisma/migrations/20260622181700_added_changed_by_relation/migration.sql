/*
  Warnings:

  - You are about to drop the column `changedBy` on the `offer_revision` table. All the data in the column will be lost.
  - Added the required column `changedById` to the `offer_revision` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "offer_revision" DROP COLUMN "changedBy",
ADD COLUMN     "changedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "offer_revision" ADD CONSTRAINT "offer_revision_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
