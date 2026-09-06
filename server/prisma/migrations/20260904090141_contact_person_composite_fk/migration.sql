-- DropForeignKey
ALTER TABLE "offer" DROP CONSTRAINT "offer_contactPersonId_fkey";

-- DropForeignKey
ALTER TABLE "offer_discount" DROP CONSTRAINT "offer_discount_offerId_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_contactPersonId_fkey";

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_contactPersonId_customerId_fkey" FOREIGN KEY ("contactPersonId", "customerId") REFERENCES "contact_person"("id", "customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_discount" ADD CONSTRAINT "offer_discount_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_contactPersonId_customerId_fkey" FOREIGN KEY ("contactPersonId", "customerId") REFERENCES "contact_person"("id", "customerId") ON DELETE RESTRICT ON UPDATE CASCADE;
