import Button from "@/components/button/button";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
    label: string;
    description: string;
    file: File | null;
    onUpload: (file: File) => void;
    onDelete: () => void;
}

export const Route = createFileRoute("/_main/")({
    component: RouteComponent,
});

type TemplateType = "angebot" | "bestellung" | "rechnung" | "renewal";

const TEMPLATES: { type: TemplateType; label: string; description: string }[] = [
    { type: "angebot", label: "Angebot", description: "Vorlage für Kundenangebote" },
    { type: "bestellung", label: "Bestellung", description: "Vorlage für Bestellungen" },
    { type: "rechnung", label: "Rechnung / Invoice", description: "Vorlage für Rechnungen" },
    { type: "renewal", label: "Renewal", description: "Vorlage für Vertragsverlängerungen" },
];

function TemplateRow({ label, description, file, onUpload, onDelete }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-(--page-bg) border border-(--border)">
                    <FileText className="size-4 text-gray-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{description}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {file ? (
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FileText className="size-3.5 text-gray-400" />
                        {file.name}
                    </span>
                ) : (
                    <span className="text-sm text-gray-400 italic">Kein Template gesetzt</span>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept=".docx,.doc,.odt"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUpload(f);
                        e.target.value = "";
                    }}
                />

                <div className="flex items-center gap-1">
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={<Upload className="size-3.5" />}
                        onClick={() => inputRef.current?.click()}
                    >
                        {file ? "Ersetzen" : "Hochladen"}
                    </Button>
                    {file && (
                        <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            icon={<Trash2 className="size-3.5" />}
                            onClick={onDelete}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function RouteComponent() {
    const [templates, setTemplates] = useState<Record<TemplateType, File | null>>({
        angebot: null,
        bestellung: null,
        rechnung: null,
        renewal: null,
    });

    return (
        <div className="grid gap-6">
            <div>
                <h1 className="text-2xl font-medium">Dashboard</h1>
            </div>

            <div className="grid border border-(--border) rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) bg-(--page-bg)">
                    <div>
                        <p className="text-sm font-medium">Dokument-Templates</p>
                        <p className="text-xs text-gray-400">DOCX-Vorlagen für die Dokumenterstellung</p>
                    </div>
                </div>

                <div className="divide-y divide-(--border)">
                    {TEMPLATES.map(({ type, label, description }) => (
                        <TemplateRow
                            key={type}
                            label={label}
                            description={description}
                            file={templates[type]}
                            onUpload={(file) => setTemplates((prev) => ({ ...prev, [type]: file }))}
                            onDelete={() => setTemplates((prev) => ({ ...prev, [type]: null }))}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
