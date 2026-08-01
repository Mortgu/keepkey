import { Download, ListFilter, Plus } from "lucide-react";
import { useState } from "react";
import type { FilterSectionConfig, FilterValue } from "@/components";
import { Button, FilterSidebar, PageWidth, RouteError, SearchBar, Skeleton, createDefaultFilters, tableStyles } from "@/components";
import { useCustomers } from "@/hooks/customers/customer-hooks";
import CustomerTable from "./-components/customer-table";

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

    const [query, setQuery] = useState<string>("");

    const { customers, isPending, error } = useCustomers();

    const ts = tableStyles();

    return (
        <PageWidth variant="none">
            <div className="flex h-full">
                <div className="flex-1 grid grid-rows-[auto_1fr]">
                    <div className="flex-1 h-fit">
                        <div className="grid gap-4 px-8 py-6 border-b border-(--border)">

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
                                    <Button icon={<Plus size={14} strokeWidth={3} />} variant="primary" size="sm"
                                    >Kunde anlegen</Button>
                                </div>
                            </div>


                        </div>

                        <div className="flex items-center justify-between gap-4 border-b border-(--border) p-4 px-8">
                            <div className="flex items-center gap-2">
                                <SearchBar value={query} onChange={setQuery} />
                            </div>
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

                    <div className="bg-gray-100 h-full px-8 py-4">
                        {error ? (
                            <RouteError error={error} />
                        ) : isPending ? (
                            <div className="bg-white border border-(--border) rounded-md overflow-hidden">
                                <div className="flex items-center gap-6 px-4 py-2.5 border-b border-(--border) bg-(--subtle-50)">
                                    <Skeleton className="h-3.5 w-24" />
                                    <Skeleton className="h-3.5 w-32" />
                                    <Skeleton className="h-3.5 w-20" />
                                    <Skeleton className="h-3.5 w-20" />
                                </div>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-6 px-4 py-3.5 border-b border-(--border) last:border-b-0">
                                        <div className="flex items-center gap-2.5 flex-1">
                                            <Skeleton shape="circle" className="size-[30px] shrink-0" />
                                            <div className="flex flex-col gap-1">
                                                <Skeleton className="h-3.5 w-32" />
                                                <Skeleton className="h-3 w-40" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-3.5 w-24" />
                                        <Skeleton className="h-3.5 w-12" />
                                        <Skeleton className="h-3.5 w-20" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <CustomerTable customers={customers} />
                        )}
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
