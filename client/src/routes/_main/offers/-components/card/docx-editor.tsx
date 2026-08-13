import { Button } from '@/components';
import '@docx-editor.dev/core/styles/editor.css';

import { loadDefaultFonts } from '@docx-editor.dev/fonts';
import { DocxEditor, useDocxEditor, useEditorCommand, useEditorState, type DocxEditorRef } from '@docx-editor.dev/react';
import { useMemo, useRef } from 'react';
import { toast } from 'react-toastify';

interface Props {
    document?: Uint8Array;
    displayName?: string;
    onSave: (file: File) => void;
}

export default function OfferDocxEditor({ document, displayName = "unnamed.docx", onSave }: Props) {
    const fonts = useMemo(() => loadDefaultFonts(), []);
    const editorRef = useRef<DocxEditorRef>(null);

    const image = useEditorState((s) => s.image);
    const editor = useDocxEditor();
    console.log(editor);
    console.log(editor?.getSelectedImage())
    console.log(editor?.snapshot().image);

    const save = useEditorCommand("file.save");

    const handleSave = async () => {
        const buffer = await editorRef.current?.save();

        if (!buffer) {
            toast.error("OfferDocxEditor: File buffer dose not exists!");
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
            title={displayName}
            document={document}
            onSave={handleSave}
            renderTitleBarRight={
                () => (
                    <>
                        <Button size="sm" variant="border">Abbrechen</Button>
                        <Button size="sm" onClick={() => save.execute()}>Speichern</Button>
                    </>
                )
            }
        />
    )
}