import type {Document} from "@/types";
import {useDocumentTask} from "@/hooks";
import {useEffect, useState} from "react";

type Props = {
    document: Document;
}

export function Document({document}: Props) {
    const {task: polledTask} = useDocumentTask(document.taskId)

    const [status, setStatus] = useState<String>(document.status);

    useEffect(() => {
        setStatus(document.status);
    }, [polledTask]);

    return (
        <div className="grid gap-2">
            {document.displayName}
            {status}
        </div>
    )
}