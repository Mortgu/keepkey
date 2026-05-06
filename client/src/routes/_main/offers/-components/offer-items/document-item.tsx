import { Button } from "@/components";
import { BASE_URL } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Document } from "@/types";
import { File, RotateCw } from "lucide-react";

type Props = {
    document: Document;
}

export function DocumentItem({ document }: Props) {
    return (
        <div className="flex items-center justify-between border border-(--border) py-2 px-2 rounded-md">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-(--subtle-50) rounded-full">
                    <File className="size-4" />
                </div>
                <div className="flex flex-col justify-between">
                    <h1 className="text-md">{document.pdfName}</h1>
                    <div className="flex font-light text-sm gap-2 text-(--text-secondary)">
                        <p>{formatDate(document.createdAt)}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <a target="_blank" href={BASE_URL + "/" + document.pdfPath}>
                    <Button variant="secondary" size="sm">PDF</Button>
                </a>
                <a href={BASE_URL + "/" + document.docxPath} download={document.docxName}>
                    <Button variant="secondary" size="sm">DOCX</Button>
                </a>

                {/*<Button variant="secondary" size="sm" icon={<RotateCw className="size-3.5" />} iconOnly /> */}
            </div>
        </div>
    )
} 