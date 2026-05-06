import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components";
import { BASE_URL } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Document } from "@/types";
import { File, Loader, Trash } from "lucide-react";

type Props = {
    document: Document;
}

export function DocumentItem({ document }: Props) {
    const queryClient = useQueryClient();
    const isGenerated = document.status === "GENERATED";

    useEffect(() => {
        if (isGenerated) return;

        const interval = setInterval(() => {
            queryClient.invalidateQueries({ queryKey: ["offers"] });
        }, 3000);

        return () => clearInterval(interval);
    }, [isGenerated, queryClient]);

    const bg = document.isCurrent ? 'bg-(--primary-100)' : 'bg-white'

    return (
        <div className={"flex items-center justify-between border border-(--border) py-2 px-2 rounded-md " + bg}>
            <div className="flex items-center gap-3">
                <div className="p-3 bg-(--subtle-50) rounded-full">
                    {isGenerated ? (
                        <File className="size-4" />
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

                <Button variant="secondary" size="sm" disabled={!isGenerated} icon={<Trash className="size-3" />} iconOnly />
            </div>
        </div>
    )
}
