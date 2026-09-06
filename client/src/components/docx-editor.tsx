import '@docx-editor.dev/core/styles/editor.css';

import { loadDefaultFonts } from '@docx-editor.dev/fonts';
import { DocxEditor, composeFontConfiguration } from '@docx-editor.dev/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { DocxEditorRef, FontResolver } from '@docx-editor.dev/react';
import { Button } from './button';
import { showToast } from './toast';

interface Props {
    document?: Uint8Array;
    displayName?: string;
    onSave: (file: File) => void;
    onClose: () => void;
}

/**
 * DOCX-Editor für alles, was als .docx-Datei vorliegt.
 *
 * Bewusst ohne eigenen Begriff davon, was da bearbeitet wird: er bekommt
 * Bytes und gibt eine Datei zurück. So bearbeitet dieselbe Komponente sowohl
 * erzeugte Dokumente als auch die Vorlagen, aus denen sie entstehen.
 *
 * Auch die Darstellung bleibt beim Aufrufer — er entscheidet, ob der Editor
 * bildschirmfüllend liegt oder in einem Dialog.
 */
export default function DocumentDocxEditor({ document, displayName = "unnamed.docx", onSave, onClose }: Props) {
    const { t } = useTranslation();
    const editorRef = useRef<DocxEditorRef>(null);

    const fontResolver: FontResolver = async (request) => {
        const defaults = await loadDefaultFonts();
        const defaultFamilies = ['Calibri', 'Cambria', 'Times New Roman', 'Arial', 'Courier New'];
        const substituteMap: Record<string, string> = {
            "Arial Unicode MS": "Liberation Sans",
            "Courier": "Liberation Mono",
            "Tahoma": "Liberation Sans",
            "OpenSymbol": "Liberation Sans",
        };

        const extraSubs = request.families
            .filter(f => !defaultFamilies.includes(f))
            .map(f => ({
                from: { family: f, weight: 400, style: "normal" as const },
                to: { family: substituteMap[f] ?? "Carlito", weight: 400, style: "normal" as const },
            }));

        return composeFontConfiguration(defaults, { substitutions: extraSubs });
    }

    const handleSave = async () => {
        const buffer = await editorRef.current?.save();

        if (!buffer) {
            showToast.error("docxEditor.noBuffer");
            return;
        }

        const file = new File([buffer], displayName, {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        onSave(file);
    }

    return (
        <DocxEditor
            ref={editorRef}
            document={document}
            fonts={fontResolver}
            title={displayName}
            onSave={handleSave}
            renderTitleBarRight={() => (
                <>
                    <Button variant="border" size="xs" onClick={onClose}>{t("button.cancel")}</Button>
                    <Button variant="primary" size="xs" onClick={handleSave}>{t("button.save")}</Button>
                </>
            )}
        />
    )
}
