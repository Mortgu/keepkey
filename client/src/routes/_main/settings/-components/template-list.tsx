import type {CloudFile} from "@/types/cloud.ts";
import {formatBytesToKB} from "@/lib/utils.ts";
import {Button} from "@/components";
import {Plus, RotateCcw} from "lucide-react";

type Props = {
    templates: Array<CloudFile>;
}

export default function TemplateList(props: Props) {
    const {templates} = props;

    return (
        <div className="grid gap-4 border border-(--border) p-4 bg-(--page-bg) rounded-md shadow-sm">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Vorlagen verwalten</h1>

                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" icon={<Plus className="size-4"/>}>Hochladen</Button>
                    <Button size="sm" variant="secondary" icon={<RotateCcw className="size-3.5"/>} iconOnly/>
                </div>
            </div>

            <div className="grid gap-2">
                {templates.map(template => (
                    <div className="border border-(--border) py-3 px-4 rounded-md bg-white ">
                        <p className="">{template.basename}</p>
                        <p className="text-sm text-(--text-secondary)">
                            {template.filename} | {formatBytesToKB(template.size)}
                        </p>
                    </div>
                ))}
            </div>

        </div>
    )
}