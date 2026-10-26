-- Einkauf speichert nur noch den Gesamtbetrag je Position. Freimonate gibt es
-- nur auf der Verkaufsseite; der bisher automatisch abgezogene Einkaufsrabatt
-- wird in den Gesamtbetrag eingerechnet, damit bestehende Bestellungen ihre
-- bisherige Einkaufssumme behalten.
UPDATE "order_position"
SET "purchase_total_cents" = "purchase_total_cents" - "purchase_discount_cents";

-- AlterTable
ALTER TABLE "order_position" DROP COLUMN "purchase_discount_cents",
DROP COLUMN "purchase_eur_user_month";
