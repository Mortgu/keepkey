-- AlterTable
ALTER TABLE "contact_person" ALTER COLUMN "salutation" DROP NOT NULL;

-- AlterTable
ALTER TABLE "customer" ALTER COLUMN "street" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "zip" DROP NOT NULL;

-- AlterTable
ALTER TABLE "supplier" ALTER COLUMN "supplierId" DROP NOT NULL;
