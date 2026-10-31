-- Plain column renames for is-prefix consistency with the rest of the
-- schema (isActive, isCurrent). No type change, so a straight RENAME COLUMN
-- keeps existing data intact.
ALTER TABLE "offer_position" RENAME COLUMN "optional" TO "isOptional";

ALTER TABLE "offer" RENAME COLUMN "featureComparison" TO "showsFeatureComparison";
