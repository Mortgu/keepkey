import { z } from "zod";

import { documentTemplateKindSchema, languageSchema } from "@keepit/schemas";

export const documentTemplateParamsSchema = z.object({
    id: z.string().min(1),
});

/**
 * Metadaten des Uploads.
 *
 * Sie stehen im Query-String, weil der Body die Datei selbst ist — dasselbe
 * Vorgehen wie beim bisherigen Vorlagen-Upload. Der Dateiname wird nur
 * angezeigt und für den Download benutzt, adressiert also nichts; die
 * Zeichenprüfung hält lediglich Steuerzeichen und Pfadtrenner aus
 * `Content-Disposition` heraus.
 */
export const uploadDocumentTemplateQuerySchema = z.object({
    kind: documentTemplateKindSchema,
    language: languageSchema,
    name: z.string().trim().min(1).max(120).optional(),
    fileName: z.string()
        .trim()
        .min(1)
        .max(180)
        .refine((value) => value.toLowerCase().endsWith(".docx"), "Nur .docx-Dateien sind erlaubt!")
        .refine(
            (value) => !/[\\/\u0000-\u001f\u007f]/.test(value),
            "fileName contains invalid characters",
        ),
});

export const renameDocumentTemplateSchema = z.object({
    name: z.string()
        .trim()
        .min(1, "name required!")
        .max(120, "name must not exceed 120 characters"),
});
