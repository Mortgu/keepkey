/*
  Warnings:

  - You are about to drop the column `reason` on the `tariff_version` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tariff_version" DROP COLUMN "reason";

-- DropEnum
DROP TYPE "TariffVersionReason";
