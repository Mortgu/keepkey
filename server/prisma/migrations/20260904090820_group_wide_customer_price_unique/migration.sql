-- Gruppenweite Kundenpreise ("gilt fuer alle Produkte") sind fachlich
-- gewollt: der Seed schreibt sie (prisma/seeds/tariffs.ts) und die
-- Preisermittlung liest sie als Fallback (utils/products.ts). Das
-- Prisma-Unique @@unique([tariffId, customerId, productId, duration,
-- min_quantity]) deckt sie aber nicht ab, weil Postgres NULLs im
-- Unique-Index als distinct behandelt — beliebig viele gruppenweite
-- Zeilen an derselben Koordinate waeren moeglich, und findCustomerPrice
-- wuerde eine davon nichtdeterministisch ziehen.
--
-- Der partielle Index schliesst genau diese Luecke und ist das Komplement
-- zum Prisma-Unique: er grenzt nur Zeilen mit productId IS NULL ein, die
-- uebrigen (productId NOT NULL) bleiben vom Prisma-Unique abgedeckt.
-- Partielle Indexe kann Prisma nicht ausdruecken und ignoriert sie beim
-- Schema-Diff — dasselbe Muster wie offer_document_active_generation_key.

-- Fail with actionable diagnostics instead of partially applying the constraint to inconsistent history.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "tariff_customer_price"
        WHERE "productId" IS NULL
        GROUP BY "tariffId", "customerId", "duration", "min_quantity"
        HAVING COUNT(*) > 1
    ) THEN RAISE EXCEPTION 'Duplicate group-wide customer prices must be resolved before migration';
    END IF;
END $$;

-- At most one group-wide price per coordinate.
CREATE UNIQUE INDEX "tariff_customer_price_group_wide_key"
ON "tariff_customer_price"("tariffId", "customerId", "duration", "min_quantity")
WHERE "productId" IS NULL;
