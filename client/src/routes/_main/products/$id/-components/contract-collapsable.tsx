import {useState} from "react";
import {ChevronRight, Plus, UndoDot} from "lucide-react";
import {Button, Drawer} from "@/components";
import type {Contract, Product, TariffHistory} from "@/types";
import {localized} from "@/lib/i18n-content.ts";
import {useLocale, useTariffHistoryHook, useTariffHook} from "@/hooks";
import TariffComponent from "@/routes/_main/products/$id/-components/tariff-component.tsx";
import {formatDate} from "@/lib/format.ts";

type Props = {
    product: Product;
    contract: Contract;
}

function TariffHistoryList({tariffId}: { tariffId: string }) {
    const {history, isPending} = useTariffHistoryHook(tariffId);
    const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

    if (isPending) return <p className="text-sm text-gray-500">Laden...</p>;
    if (history.length === 0) return <p className="text-sm text-gray-500">Keine Versionen vorhanden.</p>;

    return (
        <div className="grid gap-1">
            {history.map((entry: TariffHistory) => (
                <div key={entry.id} className="border border-(--border) rounded-md">
                    <button
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-(--page-bg) text-left"
                        onClick={() => setExpandedVersion(expandedVersion === entry.version ? null : entry.version)}
                    >
                        <div className="flex items-center gap-2">
                            <ChevronRight
                                className={expandedVersion === entry.version ? "size-4 rotate-90 transition-all" : "transition-all size-4"}/>
                            <span className="font-medium">Version {entry.version}</span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(entry.createdAt)}</span>
                    </button>

                    {expandedVersion === entry.version && entry.snapshot && (
                        <div className="border-t border-(--border) p-3">
                            <div className="grid gap-2">
                                <div className="flex gap-2 text-left">
                                    <div className="flex-1 grid">
                                        <div/>
                                        {entry.snapshot.rows?.map((row) => (
                                            <div key={row.id}
                                                 className="py-1 text-sm">{row.min_quantity} - {row.max_quantity ?? "∞"}</div>
                                        ))}
                                    </div>

                                    <div className="flex-3 flex flex-wrap items-center gap-2">
                                        {entry.snapshot.columns?.map((column) => (
                                            <div key={column.id} className="flex-1 grid gap-2">
                                                <div className="text-center text-sm font-medium rounded-md px-3">
                                                    {column.duration} Monate
                                                </div>
                                                {entry.snapshot.cells
                                                    ?.filter(cell => cell.columnId === column.id)
                                                    .sort((a, b) => {
                                                        const rowA = entry.snapshot.rows?.find(r => r.id === a.rowId);
                                                        const rowB = entry.snapshot.rows?.find(r => r.id === b.rowId);
                                                        return (rowA?.min_quantity ?? 0) - (rowB?.min_quantity ?? 0);
                                                    })
                                                    .map(cell => (
                                                        <div key={cell.id}
                                                             className="text-center text-sm rounded-md px-3 py-1 bg-(--page-bg)">
                                                            {cell.default_cells?.[0]?.price ?? "-"}
                                                        </div>
                                                    ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function ContractCollapsable(props: Props) {
    const locale = useLocale();

    const {product, contract} = props;

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    const {tariffs, createTariff} = useTariffHook(product.id);

    const matches = tariffs.filter(tariff => tariff.contractId === contract.id);

    return (
        <div className="grid bg-white border border-(--border) rounded-md shadow-xs">
            <div className="flex items-center justify-between border-b border-(--border)">
                <div onClick={() => setModalOpen(!modalOpen)}
                     className="w-full flex items-center gap-2 py-4 px-5 hover:bg-(--page-bg) hover:cursor-pointer select-none">
                    <ChevronRight className={modalOpen ? "size-4 rotate-90 transition-all" : "transition-all size-4"}/>
                    <h1>{localized(contract.translations, locale, "name")}</h1>
                </div>

                <div className="flex items-center gap-2 px-2">
                    <Button icon={<UndoDot className="size-4"/>} iconOnly variant="secondary" size="sm"
                            onClick={() => setDrawerOpen(true)}/>

                    <Button icon={<Plus className="size-4"/>} iconOnly variant="secondary" size="sm"
                            onClick={() => createTariff({productId: product.id, contractId: contract.id})}/>
                </div>
            </div>

            {modalOpen && (
                <div className="w-full grid gap-2 p-4">
                    {matches.map((tariff) => (
                        <TariffComponent
                            key={tariff.id}
                            tariff={tariff}
                        />
                    ))}
                </div>
            )}

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} wide>
                <Drawer.Header eyebrow="" title="History"
                               subtitle="Vergangene Preistabellen"/>
                <Drawer.Body>
                    <div className="grid gap-4">
                        {matches.map((tariff) => (
                            <div key={tariff.id}>
                                <h2 className="font-medium mb-2">Tariff {formatDate(tariff.createdAt)}</h2>
                                <TariffHistoryList tariffId={tariff.id}/>
                            </div>
                        ))}
                    </div>
                </Drawer.Body>
            </Drawer>
        </div>
    );
}
