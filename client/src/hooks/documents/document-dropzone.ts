import { useDropzone } from "react-dropzone";
import type { FileRejection } from "react-dropzone";
import type { ReplacedDocument } from "@keepit/schemas";
import { showToast } from "@/components";

interface Props {
    disabled: boolean;
    replaceDocument: (file: File) => Promise<ReplacedDocument>;
}

export default function useDocumentDropzone({ disabled, replaceDocument }: Props) {
    const dropzoneOptions = {
        noClick: true,
        noKeyboard: true,
        multiple: false,
        disabled: disabled,
        accept: {
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": []
        },
    };

    // Erst nach dem Hochladen melden, nicht schon beim Annehmen der Datei:
    // Bricht der Upload ab — etwa an einer fehlenden CORS-Regel des Buckets —
    // stünde sonst trotzdem "erfolgreich ersetzt" da.
    const handleDrop = async (acceptedFiles: Array<File>) => {
        const [file] = acceptedFiles;

        // Ein leerer Drop liefert kein Element, auch wenn der Typ das nicht abbildet.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (file === undefined) {
            return;
        }

        try {
            await replaceDocument(file);
            showToast.success('documents.toast.replaced');
        } catch {
            // Der globale onError-Handler zeigt die Server-Meldung bereits an.
        }
    }

    const handleDropRejected = (rejections: Array<FileRejection>) => {
        const reason = rejections.flatMap(rejection => rejection.errors.map(error => error.message)).join(' & ');
        showToast.error("documents.toast.fileRejected", {
            vars: { reason },
        })
    }

    const handleError = (error: Error) => {
        const reason = error.message;
        showToast.error('documents.toast.fileRejected', {
            vars: { reason }
        })
    }

    const dropzone = useDropzone({
        ...dropzoneOptions,
        onDrop: handleDrop,
        onDropRejected: handleDropRejected,
        onError: handleError,
    });

    return {
        dropzone,
    }
}
