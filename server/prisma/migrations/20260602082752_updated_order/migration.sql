/*
  Warnings:

  - You are about to drop the column `projectId` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "projectId",
ADD COLUMN     "requestFrom" TIMESTAMP(3),
ADD COLUMN     "validUntil" TIMESTAMP(3);
