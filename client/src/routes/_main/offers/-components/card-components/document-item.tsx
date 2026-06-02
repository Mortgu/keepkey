import {useState} from "react";
import {Button, Input} from "@/components";
import {BASE_URL} from "@/lib/api-client";
import {formatDate} from "@/lib/format";
import {useDocumentTask, useOfferHook} from "@/hooks";
import type {Document} from "@/types";
import {Check, File, Loader, Pen, Trash, TriangleAlert, Upload} from "lucide-react";
import {tv} from "tailwind-variants";

type Props = {
    document: Document;
}

const styles = tv({
    base: [
        "flex items-center justify-between border border-(--border) py-2 px-2 rounded-md"
    ],
    variants: {
        current: {
            true: ["border-(--primary-300)"],
            false: ["bg-white"]
        }
    }
});

export function DocumentItem({document}: Props) {
    const [isRenaming, setRenaming] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>("");

    const {
        deleteDocument,
        isDeletingDocument,
        renameDocument,
        isRenamingDocument,
        upload,
        isUploading,
    } = useOfferHook();

    // Poll the task linked to this document; invalidates offers/orders cache on completion
    const {task: polledTask} = useDocumentTask(document.task?.id);
    const activeTask = polledTask ?? document.task;

    const isGenerated = document.status === "GENERATED" && activeTask?.status !== "RUNNING" && activeTask?.status !== "PENDING";
    const isFailed = activeTask?.status === "FAILED" || document.status === "FAILED";
    const isProcessing = !isGenerated && !isFailed;

    const handleRename = async () => {
        if (!newName.trim()) return;
        await renameDocument({document_id: document.id, displayName: newName.trim()});
        setRenaming(false);
        setNewName("");
    };

    const parentId = document.offerId ?? document.orderId;
    const parentPath = document.offerId ? "offers" : "orders";

    return (
        <div className={styles({current: document.isCurrent})}>
            <div className="flex items-center gap-3">
                <div className="p-3 bg-(--subtle-50) rounded-full">
                    {isGenerated ? (
                        <File className="size-4"/>
                    ) : isFailed ? (
                        <TriangleAlert className="size-4 text-(--danger-500)"/>
                    ) : (
                        <Loader className="size-4 animate-spin text-(--text-secondary)"/>
                    )}
                </div>
                <div className="flex flex-col justify-between">
                    {!isRenaming && (
                        <>
                            <h1 className="text-md">{document.displayName}</h1>
                            <div className="flex font-light text-sm gap-2 text-(--text-secondary)">
                                <p>{formatDate(document.createdAt)}</p>
                                {isProcessing && (
                                    <p className="capitalize">{(activeTask?.status ?? document.status).toLowerCase()}</p>
                                )}
                                {isFailed && activeTask?.error && (
                                    <p className="text-(--danger-500)">{activeTask.error}</p>
                                )}
                            </div>
                        </>
                    )}
                    {isRenaming && (
                        <Input
                            input_size="xs"
                            placeholder={document.displayName}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                            rightButton={{
                                icon: isRenamingDocument ? <Loader className="size-4 animate-spin"/> :
                                    <Check className="size-4"/>,
                                variant: "secondary",
                                onClick: handleRename,
                                disabled: isRenamingDocument || !newName.trim(),
                            }}
                        />
                    )}
                </div>
            </div>

            <div className="flex items-center gap-0">
                <a target="_blank" href={`${BASE_URL}/api/${parentPath}/${parentId}/documents/${document.id}/pdf`}>
                    <Button variant="ghost" size="sm" disabled={!isGenerated}>PDF</Button>
                </a>
                <a href={`${BASE_URL}/api/${parentPath}/${parentId}/documents/${document.id}/docx`}>
                    <Button variant="ghost" size="sm" disabled={!isGenerated}>DOCX</Button>
                </a>

                <Button variant="ghost" size="sm" icon={<Upload className="size-3.5"/>} iconOnly
                        onClick={() => upload({id: document.id})} loading={isUploading}/>

                <Button variant="ghost" size="sm" icon={<Pen className="size-3.5"/>}
                        iconOnly onClick={() => {
                    setNewName(document.displayName ?? "");
                    setRenaming(true);
                }}/>

                <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash className="size-3.5"/>}
                    iconOnly
                    loading={isDeletingDocument}
                    disabled={isDeletingDocument}
                    onClick={() => deleteDocument({documentId: document.id})}
                />
            </div>
        </div>
    );
}
