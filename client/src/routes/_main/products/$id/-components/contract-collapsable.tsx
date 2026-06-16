import {useState} from "react";
import {ChevronRight, Plus, UndoDot} from "lucide-react";
import {Button, Drawer} from "@/components";
import type {Contract, Customer, Product} from "@/types";
import {localized} from "@/lib/i18n-content.ts";
import {useLocale, useModal, useTariffHook} from "@/hooks";
import TariffComponent from "@/routes/_main/products/$id/-components/tariff-component.tsx";

type Props = {
    product: Product;
    contract: Contract;
    customer: Customer | null;
}

export default function ContractCollapsable(props: Props) {
    const locale = useLocale();
    const modal = useModal();

    const {product, contract, customer} = props;

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    const {
        tariffs,
        createTariff,
        addTerm,
        updateTerm,
        removeTerm,
        addBand,
        removeBand,
        updateCell,
        updateCustomerPrice,
    } = useTariffHook(product.id);

    const matches = tariffs.filter(tariff => tariff.contractId === contract.id);

    return (
        <div className="grid bg-white border border-(--border) rounded-md shadow-xs">
            {/*  */}
            <div className="flex items-center justify-between border-b border-(--border)">
                {/*  */}
                <div onClick={() => setModalOpen(!modalOpen)}
                     className="w-full flex items-center gap-2 py-4 px-5 hover:bg-(--page-bg) hover:cursor-pointer select-none">
                    <ChevronRight className={modalOpen ? "size-4 rotate-90 transition-all" : "transition-all size-4"}/>
                    <h1>{localized(contract.translations, locale, "name")}</h1>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 px-2">
                    <Button icon={<UndoDot className="size-4"/>} iconOnly variant="secondary" size="sm"
                            onClick={() => setDrawerOpen(true)}/>
                    <Button icon={<Plus className="size-4"/>} iconOnly variant="secondary" size="sm"
                            onClick={() => createTariff({productId: product.id, contractId: contract.id})}/>
                </div>
            </div>

            {/*  */}
            {modalOpen && (
                <div className="w-full grid gap-2 p-4">
                    {matches.map((tariff) => (
                        <TariffComponent
                            key={tariff.id}
                            selectedCustomer={customer}
                            tariff={tariff}
                            onAddTerm={addTerm}
                            onRemoveTerm={removeTerm}
                            onUpdateTerm={updateTerm}
                            onAddBand={addBand}
                            onRemoveBand={removeBand}
                            onUpdateCell={updateCell}
                            onUpdateCustomerPrice={updateCustomerPrice}
                        />
                    ))}
                </div>
            )}

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Drawer.Header eyebrow="" title="History"
                               subtitle="Vergangene Preistabellen"/>
                <Drawer.Body>
                    {/* content */}
                </Drawer.Body>
            </Drawer>
        </div>
    );
}