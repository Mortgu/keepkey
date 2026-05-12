import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components";
import { BASE_URL } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { useOfferHook } from "@/hooks";
import type { Document } from "@/types";
import { File, Loader, Trash, TriangleAlert } from "lucide-react";

const MAX_POLLS = 10;

type Props = {
    document: Document;
}

export function DocumentItem({ document }: Props) {
    const queryClient = useQueryClient();
    const { deleteDocument, isDeletingDocument } = useOfferHook();
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

    const bg = document.isCurrent ? 'bg-(--primary-100)' : 'bg-white'

    return (
        <div className={"flex items-center justify-between border border-(--border) py-2 px-2 rounded-md " + bg}>
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
                    <h1 className="text-md">
                        {document.displayName ?? `Version ${document.version}`}
                    </h1>
                    <div className="flex font-light text-sm gap-2 text-(--text-secondary)">
                        <p>{formatDate(document.createdAt)}</p>
                        {!isGenerated && (
                            <p className="capitalize">{document.status.toLowerCase()}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <a target="_blank" href={`${BASE_URL}/api/offers/${document.offerId}/documents/${document.id}/pdf`}>
                    <Button variant="secondary" size="sm" disabled={!isGenerated}>PDF</Button>
                </a>
                <a href={`${BASE_URL}/api/offers/${document.offerId}/documents/${document.id}/docx`}>
                    <Button variant="secondary" size="sm" disabled={!isGenerated}>DOCX</Button>
                </a>

                <Button
                    variant="secondary"
                    size="sm"
                    icon={<Trash className="size-3" />}
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
