import '@docx-editor.dev/core/styles/editor.css';

import { loadDefaultFonts } from '@docx-editor.dev/fonts';
import { DocxEditor,   composeFontConfiguration, useFonts } from '@docx-editor.dev/react';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import { googleFonts } from '@docx-editor.dev/fonts/google';
import type {DocxEditorRef, FontResolver} from '@docx-editor.dev/react';
import { Button } from '@/components';

interface Props {
    document?: Uint8Array;
    displayName?: string;
    onSave: (file: File) => void;
    onClose: () => void;
}

export default function DocumentDocxEditor({ document, displayName = "unnamed.docx", onSave, onClose }: Props) {
    const editorRef = useRef<DocxEditorRef>(null);
    const fonts = useFonts(googleFonts());

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
            toast.error("DocumentDocxEditor: File-Buffer existiert nicht!");
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
                    <Button variant="border" size="xs" onClick={onClose}>Abbrechen</Button>
                    <Button variant="primary" size="xs" onClick={handleSave}>Speichern</Button>
                </>
            )}
        />
    )
}