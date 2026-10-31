-- `RENEWAL` was never written by any code path (verified against the dev
-- database before writing this migration) — dropping it brings `TaskTarget`
-- back in line with `DocumentOwnerType`, the four values that actually have
-- a document table.
BEGIN;

ALTER TYPE "TaskTarget" RENAME TO "TaskTarget_old";
CREATE TYPE "TaskTarget" AS ENUM ('OFFER', 'ORDER', 'INVOICE', 'CONFIRMATION');
ALTER TABLE "task" ALTER COLUMN "target" TYPE "TaskTarget" USING ("target"::text::"TaskTarget");
DROP TYPE "TaskTarget_old";

COMMIT;
