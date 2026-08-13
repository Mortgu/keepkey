import { useRef, useState } from "react";
import { DocxEditor, type DocxEditorRef } from '@docx-editor.dev/react';

import '@docx-editor.dev/core/styles/editor.css';

export default function MyDocxEditor() {
    const editorRef = useRef<DocxEditorRef>(null);

    const [file, setFile] = useState<File | null>(null);
    const [bytes, setBytes] = useState<Uint8Array>();

    async function pick(e: React.ChangeEvent<HTMLInputElement>) {
        const picked = e.target.files?.[0] ?? null;
        setFile(picked);
        setBytes(picked ? new Uint8Array(await picked.arrayBuffer()) : undefined);
    }

    async function download() {
        const buffer = await editorRef.current?.save();
        if (!buffer) return;
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file?.name ?? 'document.docx';
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 8, display: 'flex', gap: 8 }}>
                <input type="file" accept=".docx" onChange={pick} />
                <button onClick={download}>Download .docx</button>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
                {bytes && <DocxEditor ref={editorRef} document={bytes} mode="edit" />}
            </div>
        </div>
    )
}