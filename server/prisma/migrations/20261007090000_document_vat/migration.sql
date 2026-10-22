-- Steuer je Beleg: beim Anlegen festgelegt, danach unveränderlich.
-- Bestehende Zeilen werden aus offer.net_amount und dem aktuellen Kundensatz
-- nachgefüllt (Rundung kaufmännisch auf den Cent, wie vatTotals()).

ALTER TABLE "confirmation"
    ADD COLUMN "taxRate"     DOUBLE PRECISION,
    ADD COLUMN "net_cents"   INTEGER,
    ADD COLUMN "vat_cents"   INTEGER,
    ADD COLUMN "gross_cents" INTEGER;

UPDATE "confirmation" c
SET "taxRate"     = cu."taxRate",
    "net_cents"   = f."net_amount",
    "vat_cents"   = ROUND(f."net_amount" * cu."taxRate" / 100.0),
    "gross_cents" = f."net_amount" + ROUND(f."net_amount" * cu."taxRate" / 100.0)
FROM "order" o
JOIN "offer" f ON f.id = o."offerId"
JOIN "customer" cu ON cu.id = f."customerId"
WHERE o.id = c."orderId";

ALTER TABLE "confirmation"
    ALTER COLUMN "taxRate"     SET NOT NULL,
    ALTER COLUMN "net_cents"   SET NOT NULL,
    ALTER COLUMN "vat_cents"   SET NOT NULL,
    ALTER COLUMN "gross_cents" SET NOT NULL;

ALTER TABLE "invoice"
    ADD COLUMN "taxRate"     DOUBLE PRECISION,
    ADD COLUMN "net_cents"   INTEGER,
    ADD COLUMN "vat_cents"   INTEGER,
    ADD COLUMN "gross_cents" INTEGER;

UPDATE "invoice" i
SET "taxRate"     = cu."taxRate",
    "net_cents"   = f."net_amount",
    "vat_cents"   = ROUND(f."net_amount" * cu."taxRate" / 100.0),
    "gross_cents" = f."net_amount" + ROUND(f."net_amount" * cu."taxRate" / 100.0)
FROM "order" o
JOIN "offer" f ON f.id = o."offerId"
JOIN "customer" cu ON cu.id = f."customerId"
WHERE o.id = i."orderId";

ALTER TABLE "invoice"
    ALTER COLUMN "taxRate"     SET NOT NULL,
    ALTER COLUMN "net_cents"   SET NOT NULL,
    ALTER COLUMN "vat_cents"   SET NOT NULL,
    ALTER COLUMN "gross_cents" SET NOT NULL;

-- Kein stilles 0 % mehr: ein Kunde ohne Satz soll beim Anlegen scheitern.
ALTER TABLE "customer" ALTER COLUMN "taxRate" DROP DEFAULT;
