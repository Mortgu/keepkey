-- Vertrag und Laufzeit wandern von der Position an den Kopf.
--
-- Fachlich hatten alle Positionen eines Belegs schon immer denselben Vertrag
-- und dieselbe Laufzeit; das Modell erzwang es nur nicht. Erzwingbar wird es
-- erst hier — und damit ist ein Angebot zum ersten Mal eindeutig genug, um von
-- seiner Restlaufzeit zu sprechen.
--
-- Von Hand geschrieben: `prisma migrate dev --create-only` verweigert den
-- Dienst nicht-interaktiv, sobald es Datenverlust erkennt.

-- 1. Spalten zunaechst nullable anlegen, damit der Backfill Platz hat.
ALTER TABLE "offer" ADD COLUMN "contractId" TEXT;
ALTER TABLE "offer" ADD COLUMN "duration_months" INTEGER;

ALTER TABLE "order" ADD COLUMN "contractId" TEXT;
ALTER TABLE "order" ADD COLUMN "duration_months" INTEGER;

-- 2. Vorher pruefen, ob es Belege mit uneinheitlichen Positionen gibt. Ohne
--    diesen Riegel naehme der Backfill stillschweigend irgendeine Position und
--    verwuerfe die Werte der anderen — genau der Datenverlust, den die
--    Umstellung verhindern soll.
DO $$
DECLARE
    offender TEXT;
BEGIN
    SELECT string_agg(DISTINCT "offerId", ', ') INTO offender
    FROM "offer_position"
    GROUP BY "offerId"
    HAVING count(DISTINCT "contractId") > 1 OR count(DISTINCT "duration_months") > 1;

    IF offender IS NOT NULL THEN
        RAISE EXCEPTION
            'Angebote mit uneinheitlichem Vertrag oder uneinheitlicher Laufzeit: %. Bitte zuerst vereinheitlichen.',
            offender;
    END IF;

    SELECT string_agg(DISTINCT "orderId", ', ') INTO offender
    FROM "order_position"
    GROUP BY "orderId"
    HAVING count(DISTINCT "contractId") > 1 OR count(DISTINCT "duration_months") > 1;

    IF offender IS NOT NULL THEN
        RAISE EXCEPTION
            'Bestellungen mit uneinheitlichem Vertrag oder uneinheitlicher Laufzeit: %. Bitte zuerst vereinheitlichen.',
            offender;
    END IF;
END $$;

-- 3. Backfill. Nach Schritt 2 ist die Auswahl eindeutig — jede Position eines
--    Belegs traegt dieselben Werte.
UPDATE "offer" o
SET "contractId" = p."contractId",
    "duration_months" = p."duration_months"
FROM (
    SELECT DISTINCT ON ("offerId") "offerId", "contractId", "duration_months"
    FROM "offer_position"
    ORDER BY "offerId", "createdAt"
) p
WHERE p."offerId" = o."id";

UPDATE "order" o
SET "contractId" = p."contractId",
    "duration_months" = p."duration_months"
FROM (
    SELECT DISTINCT ON ("orderId") "orderId", "contractId", "duration_months"
    FROM "order_position"
    ORDER BY "orderId", "createdAt"
) p
WHERE p."orderId" = o."id";

-- 4. Belege ohne jede Position koennen keinen Vertrag erben. Sie sind fachlich
--    unvollstaendig (das Anlegen verlangt mindestens eine Position); statt sie
--    mit einem beliebigen Vertrag aufzufuellen, bricht die Migration ab.
DO $$
DECLARE
    orphan TEXT;
BEGIN
    SELECT string_agg("id", ', ') INTO orphan FROM "offer" WHERE "contractId" IS NULL;
    IF orphan IS NOT NULL THEN
        RAISE EXCEPTION 'Angebote ohne Positionen, deren Vertrag sich nicht ableiten laesst: %.', orphan;
    END IF;

    SELECT string_agg("id", ', ') INTO orphan FROM "order" WHERE "contractId" IS NULL;
    IF orphan IS NOT NULL THEN
        RAISE EXCEPTION 'Bestellungen ohne Positionen, deren Vertrag sich nicht ableiten laesst: %.', orphan;
    END IF;
END $$;

-- 5. Jetzt tragen die Spalten Werte und koennen verbindlich werden.
ALTER TABLE "offer" ALTER COLUMN "contractId" SET NOT NULL;
ALTER TABLE "offer" ALTER COLUMN "duration_months" SET NOT NULL;

ALTER TABLE "order" ALTER COLUMN "contractId" SET NOT NULL;
ALTER TABLE "order" ALTER COLUMN "duration_months" SET NOT NULL;

ALTER TABLE "offer"
    ADD CONSTRAINT "offer_contractId_fkey"
    FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "order"
    ADD CONSTRAINT "order_contractId_fkey"
    FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Erst danach die Positionsspalten entfernen — vorher waeren die Werte weg,
--    aus denen der Backfill liest.
ALTER TABLE "offer_position" DROP CONSTRAINT "offer_position_contractId_fkey";
ALTER TABLE "offer_position" DROP COLUMN "contractId";
ALTER TABLE "offer_position" DROP COLUMN "duration_months";

ALTER TABLE "order_position" DROP CONSTRAINT "order_position_contractId_fkey";
ALTER TABLE "order_position" DROP COLUMN "contractId";
ALTER TABLE "order_position" DROP COLUMN "duration_months";
