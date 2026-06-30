-- DropForeignKey
ALTER TABLE "tariff" DROP CONSTRAINT "tariff_tariffGroupId_fkey";

-- AddForeignKey
ALTER TABLE "tariff" ADD CONSTRAINT "tariff_tariffGroupId_fkey" FOREIGN KEY ("tariffGroupId") REFERENCES "tariff_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
