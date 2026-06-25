/*
  Warnings:

  - Added the required column `updatedAt` to the `contract` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdAt` on table `contract` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `contract_translation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contract" ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "contract_translation" ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;
