-- CreateEnum
CREATE TYPE "DocumentTemplateKind" AS ENUM ('OFFER', 'ORDER');

-- CreateTable
CREATE TABLE "document_template" (
    "id" TEXT NOT NULL,
    "kind" "DocumentTemplateKind" NOT NULL,
    "language" "Language" NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "document_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_template_objectKey_key" ON "document_template"("objectKey");

-- CreateIndex
CREATE INDEX "document_template_kind_language_idx" ON "document_template"("kind", "language");

-- CreateIndex
CREATE INDEX "document_template_createdById_idx" ON "document_template"("createdById");

-- AddForeignKey
ALTER TABLE "document_template" ADD CONSTRAINT "document_template_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Genau eine aktive Vorlage je (kind, language).
--
-- Von Hand geschrieben: Prisma kennt keinen partiellen Index, ein gewoehnliches
-- @@unique([kind, language]) wuerde dagegen auch die inaktiven Vorlagen der
-- Bibliothek auf eine je Slot begrenzen. Der Index faengt ausserdem zwei
-- gleichzeitige "Aktiv setzen"-Klicks ab.
CREATE UNIQUE INDEX "document_template_active_slot"
    ON "document_template" ("kind", "language")
    WHERE "isActive";
