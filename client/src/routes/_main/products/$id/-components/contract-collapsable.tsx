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

function TariffHistoryList({productId, contractId}: { productId: string; contractId: string }) {
    const {history, isPending} = useTariffHistoryHook(productId, contractId);
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
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                <tr>
                                    <th className="text-left p-1"/>
                                    {entry.snapshot.columns?.map(column => (
                                        <th key={column.id} className="p-1 text-center">{column.duration} Monate</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {entry.snapshot.rows?.map(row => (
                                    <tr key={row.id}>
                                        <td className="p-1">{row.min_quantity} - {row.max_quantity ?? "∞"}</td>
                                        {entry.snapshot.columns?.map(column => {
                                            const cell = entry.snapshot.cells?.find(
                                                c => c.rowId === row.id && c.columnId === column.id
                                            );
                                            return (
                                                <td key={column.id} className="p-1 text-center bg-(--page-bg) rounded">
                                                    {cell?.default_cells?.[0]?.price ?? "-"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
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

    const tariff = tariffs.find(t => t.contractId === contract.id);

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

            {modalOpen && tariff && (
                <div className="w-full grid gap-2 p-4">
                    <TariffComponent key={tariff.id} tariff={tariff}/>
                </div>
            )}

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} wide>
                <Drawer.Header eyebrow="" title="History"
                               subtitle="Vergangene Preistabellen"/>
                <Drawer.Body>
                    <TariffHistoryList productId={product.id} contractId={contract.id}/>
                </Drawer.Body>
            </Drawer>
        </div>
    );
}
