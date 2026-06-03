import type { Document, DocumentStatus, TaskStatus } from "@/types";
import { useDocumentTask, useOfferHook } from "@/hooks";
import { useEffect, useState } from "react";
import { File, Loader, RotateCcw, Trash } from "lucide-react";
import { Button } from "@/components";

type Props = {
    document: Document;
}

export function Document({ document }: Props) {
    const { deleteDocument, isDeletingDocument, errorDeletingDocument } = useOfferHook();
    const { task: polledTask } = useDocumentTask(document.taskId);

    const [status, setStatus] = useState<DocumentStatus>(document.status);

    useEffect(() => {
        if (polledTask?.status === "COMPLETED") {
            setStatus("GENERATED");
        }
    }, [polledTask?.status]);

    return (
        <div className="flex items-center justify-between border border-(--border) p-2 rounded-md">
            <div className="flex items-center gap-2">
                {status === "GENERATED" && (
                    <File className="size-4" />
                )}

                {(status === "PENDING" || status === "PROCESSING" || status === "UPLOADING") && (
                    <Loader className="size-4 animate-spin" />
                )}
            </div>
            <div className="flex flex-col justify-between">
                <h1>{document.displayName}</h1>
            </div>

            <div className="flex items-center">
                <Button variant="secondary" size="sm" icon={<Trash className="size-3.5" />} iconOnly
                    onClick={() => deleteDocument({ documentId: document.id })} loading={isDeletingDocument || !!errorDeletingDocument} disabled={isDeletingDocument || !!errorDeletingDocument} />
            </div>
        </div>
    )
}