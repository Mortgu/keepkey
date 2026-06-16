-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('EUR', 'RAND', 'DOLLAR', 'CHF');

-- AlterTable
ALTER TABLE "customer" ADD COLUMN     "country" TEXT DEFAULT 'Deutschland',
ADD COLUMN     "currency" "Currency" DEFAULT 'EUR',
ADD COLUMN     "language" "Language" DEFAULT 'DE';
