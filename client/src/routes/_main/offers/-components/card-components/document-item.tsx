import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "@/components";
import { BASE_URL } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { useOfferHook } from "@/hooks";
import type { Document } from "@/types";
import { Check, File, Loader, Pen, Trash, TriangleAlert, Upload } from "lucide-react";
import { tv } from "tailwind-variants";

const MAX_POLLS = 10;

type Props = {
    document: Document;
}

const styles = tv({
    base: [
        "flex items-center justify-between border border-(--border) py-2 px-2 rounded-md"
    ],
    variants: {
        current: {
            true: [
                "border-(--primary-300)"
            ],
            false: [
                "bg-white"
            ]
        }
    }
})

export function DocumentItem({ document }: Props) {
    const queryClient = useQueryClient();

    const [isRenaming, setRenaming] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>("");
    const {
        deleteDocument,
        isDeletingDocument,
        renameDocument,
        isRenamingDocument,
        upload,
        isUploading
    } = useOfferHook();

    const handleRename = async () => {
        if (!newName.trim()) return;
        await renameDocument({ document_id: document.id, displayName: newName.trim() });
        setRenaming(false);
        setNewName("");
    };

    const isGenerated = document.status === "GENERATED";
    const isFailed = document.status === "FAILED";
    const isPolling = !isGenerated && !isFailed;
    const pollCount = useRef(0);

    useEffect(() => {
        if (!isPolling) return;

        const interval = setInterval(() => {
            pollCount.current += 1;
            if (pollCount.current > MAX_POLLS) {
                clearInterval(interval);
                return;
            }
            queryClient.invalidateQueries({ queryKey: ["offers"] });
        }, 3000);

        return () => clearInterval(interval);
    }, [isPolling, queryClient]);


    return (
        <div className={styles({ current: document.isCurrent })}>
            <div className="flex items-center gap-3">
                <div className="p-3 bg-(--subtle-50) rounded-full">
                    {isGenerated ? (
                        <File className="size-4" />
                    ) : isFailed ? (
                        <TriangleAlert className="size-4 text-(--danger-500)" />
                    ) : (
                        <Loader className="size-4 animate-spin text-(--text-secondary)" />
                    )}
                </div>
                <div className="flex flex-col justify-between">
                    {!isRenaming && (
                        <>
                            <h1 className="text-md">{document.displayName}</h1>

                            <div className="flex font-light text-sm gap-2 text-(--text-secondary)">
                                <p>{formatDate(document.createdAt)}</p>
                                {!isGenerated && (
                                    <p className="capitalize">{document.status.toLowerCase()}</p>
                                )}
                            </div>
                        </>
                    )}

                    {isRenaming && (
                        <Input
                            size="xs"
                            placeholder={document.displayName}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                            rightButton={{
                                icon: isRenamingDocument ? <Loader className="size-4 animate-spin" /> : <Check className="size-4" />,
                                variant: "secondary",
                                onClick: handleRename,
                                disabled: isRenamingDocument || !newName.trim(),
                            }}
                        />
                    )}


                </div>
            </div>

            <div className="flex items-center gap-0">

                <a target="_blank" href={`${BASE_URL}/api/offers/${document.offerId}/documents/${document.id}/pdf`}>
                    <Button variant="ghost" size="sm" disabled={!isGenerated}>PDF</Button>
                </a>
                <a href={`${BASE_URL}/api/offers/${document.offerId}/documents/${document.id}/docx`}>
                    <Button variant="ghost" size="sm" disabled={!isGenerated}>DOCX</Button>
                </a>

                <Button variant="ghost" size="sm" icon={<Upload className="size-3.5" />} iconOnly
                    onClick={() => upload({ id: document.id })} loading={isUploading} />

                <Button variant="ghost" size="sm" icon={<Pen className="size-3.5" />}
                    iconOnly onClick={() => { setNewName(document.displayName ?? ""); setRenaming(true); }} />

                <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash className="size-3.5" />}
                    iconOnly
                    loading={isDeletingDocument}
                    disabled={!document.offerId || isDeletingDocument}
                    onClick={() =>
                        document.offerId &&
                        deleteDocument({ offerId: document.offerId, documentId: document.id })
                    }
                />

            </div>
        </div>
    )
}
