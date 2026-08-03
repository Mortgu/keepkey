-- CreateEnum
CREATE TYPE "OfferDerivationType" AS ENUM ('RENEWAL', 'LICENSE_EXTENSION');

-- AlterTable
ALTER TABLE "offer" ADD COLUMN     "derivationType" "OfferDerivationType";

-- DataMigration: Bestehende abgeleitete Angebote sind ausnahmslos Verlaengerungen,
-- da die Lizenzerweiterung erst mit dieser Migration eingefuehrt wird.
UPDATE "offer" SET "derivationType" = 'RENEWAL' WHERE "renewedFromOfferId" IS NOT NULL;
