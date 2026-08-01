import { Download, ListFilter, Plus } from "lucide-react";
import { useState } from "react";
import type { FilterSectionConfig, FilterValue } from "@/components";
import { Button, FilterSidebar, Input, PageWidth, UnderlineTabs, createDefaultFilters } from "@/components";

const SIDEBAR_SECTIONS: Array<FilterSectionConfig> = [
    {
        id: "geschaeftsjahr",
        title: "Geschäftsjahr",
        kind: "pills",
        options: ["2024", "2025", "2026"],
        default: "2026",
    },
    {
        id: "status",
        title: "Status",
        kind: "checkboxes",
        items: [
            { value: "aktiv", label: "Aktiv" },
            { value: "inaktiv", label: "Inaktiv" },
            { value: "prospekt", label: "Prospekt" },
        ],
    },
    {
        id: "umsatz",
        title: "Umsatzbereich",
        kind: "price",
        min: 0,
        max: 500_000,
        step: 5_000,
    },
    {
        id: "vertragsart",
        title: "Vertragsart",
        kind: "checkboxes",
        items: [
            { value: "dienstleistung", label: "Dienstleistung" },
            { value: "wartung", label: "Wartung" },
            { value: "lizenz", label: "Lizenz" },
            { value: "beratung", label: "Beratung" },
        ],
    },
    {
        id: "betreuer",
        title: "Zuständiger Mitarbeiter",
        kind: "checkboxes",
        searchable: true,
        placeholder: "Mitarbeiter suchen…",
        items: [
            { value: "müller", label: "Anna Müller" },
            { value: "schmidt", label: "Ben Schmidt" },
            { value: "weber", label: "Carla Weber" },
            { value: "becker", label: "David Becker" },
            { value: "hoffmann", label: "Eva Hoffmann" },
            { value: "klein", label: "Felix Klein" },
        ],
    },
];

export default function CustomerPage() {
    const [filters, setFilters] = useState<Record<string, FilterValue>>(() =>
        createDefaultFilters(SIDEBAR_SECTIONS),
    );
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const onFilterChange = (id: string, v: FilterValue) =>
        setFilters((f) => ({ ...f, [id]: v }));
    const onFilterReset = () => setFilters(createDefaultFilters(SIDEBAR_SECTIONS));
    const onFilterApply = () => setSidebarOpen(false);

    const [tab, setTab] = useState("active");


    return (
        <PageWidth variant="none">
            <div className="flex h-full">
                <div className="flex-1 grid grid-rows-[auto_1fr]">
                    <div className="flex-1 h-fit">
                        <div className="grid gap-4 px-8 pt-6 border-b border-(--border)">

                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1 grid gap-1">
                                    <h1 className="font-medium text-xl">Kunden</h1>
                                    <h1 className="font-light text-sm text-gray-400">Zentrale Kundenakte — Vorgänge anlegen, Stammdaten pflegen, Verlängerungen im Blick behalten.</h1>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Export Button */}
                                    <Button icon={<Download size={14} />} variant="border" size="sm">Export</Button>
                                    {/* Create Customer Button */}
                                    <Button icon={<Plus size={14} />} variant="primary" size="sm">Kunde anlegen</Button>
                                </div>
                            </div>

                            <UnderlineTabs
                                value={tab}
                                onChange={setTab}
                                tabs={[
                                    { value: "active", label: "Aktiv", count: 12 },
                                    { value: "draft", label: "Entwurf", count: 3 },
                                    { value: "sent", label: "Versendet" },
                                    { value: "archive", label: "Archiv" },
                                ]}
                            />

                        </div>

                        <div className="flex items-center justify-between gap-4 border-b border-(--border) p-4 px-8">
                            <Input className="w-fit max-w-100" />

                            <div className="flex items-center justify-center gap-4">
                                <label className="min-w-fit text-sm text-gray-400">11 von 18</label>
                                <Button
                                    icon={<ListFilter size={14} />}
                                    size="sm"
                                    variant={sidebarOpen ? "primary" : "border"}
                                    onClick={() => setSidebarOpen((o) => !o)}
                                >
                                    Filter
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 h-full p-4">
                    </div>
                </div>



                <div className="h-full">
                    {sidebarOpen && (
                        <FilterSidebar
                            sections={SIDEBAR_SECTIONS}
                            value={filters}
                            onChange={onFilterChange}
                            onReset={onFilterReset}
                            onApply={onFilterApply}
                        />
                    )}
                </div>
            </div>

        </PageWidth>
    );
}
