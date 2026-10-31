-- Rename only, no data loss: Prisma's own diff would drop and recreate the
-- column (see git history of this file) because it doesn't track renames by
-- itself. Written by hand instead, like the partial unique index this table
-- already carries from its initial migration.
ALTER TYPE "DocumentTemplateKind" RENAME TO "DocumentTemplateType";

ALTER TABLE "document_template" RENAME COLUMN "kind" TO "type";

ALTER INDEX "document_template_kind_language_idx" RENAME TO "document_template_type_language_idx";
