import type { DocumentTemplate, DocumentTemplateKind, Language } from "@keepit/schemas";
import { BASE_URL, api } from "@/lib/api-client";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const getTemplates = () =>
    api<Array<DocumentTemplate>>("/api/templates");

export type UploadTemplateInput = {
    kind: DocumentTemplateKind;
    language: Language;
    file: File;
    name?: string;
};

/**
 * Laedt die Datei als rohen Body hoch; die Metadaten stehen im Query-String.
 *
 * Bewusst nicht ueber eine signierte S3-URL wie beim Ersetzen erzeugter
 * Dateien: die haengt an einer CORS-Regel des Buckets, und fehlt die, waere
 * die Vorlagenverwaltung unbenutzbar statt nur unbequem.
 */
export const uploadTemplate = ({ kind, language, file, name }: UploadTemplateInput) => {
    const params = new URLSearchParams({ kind, language, fileName: file.name });
    if (name) params.set("name", name);

    return api<DocumentTemplate>(`/api/templates?${params.toString()}`, {
        method: "POST",
        body: file,
        headers: { "Content-Type": DOCX_MIME },
    });
};

/** Der Weg, auf dem der DOCX-Editor speichert. */
export const replaceTemplateContent = (id: string, file: File) =>
    api<DocumentTemplate>(`/api/templates/${id}/content`, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": DOCX_MIME },
    });

export const renameTemplate = (id: string, name: string) =>
    api<DocumentTemplate>(`/api/templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
    });

export const activateTemplate = (id: string) =>
    api<DocumentTemplate>(`/api/templates/${id}/activate`, { method: "POST" });

export const deleteTemplate = (id: string) =>
    api<void>(`/api/templates/${id}`, { method: "DELETE" });

/**
 * Bytes fuer den Editor.
 *
 * Mit rohem `fetch` statt ueber `api()`, weil das jede Antwort als JSON liest —
 * hier kommt eine Datei zurueck.
 */
export const getTemplateContent = async (id: string): Promise<Uint8Array> => {
    const response = await fetch(`${BASE_URL}/api/templates/${id}/content`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Vorlage konnte nicht geladen werden (${response.status}).`);
    }

    return new Uint8Array(await response.arrayBuffer());
};

export const templateDownloadUrl = (id: string) => `${BASE_URL}/api/templates/${id}/download`;
