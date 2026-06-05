import { Badge, Button } from "@/components";
import { useModal, useTariffHook } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Pen, Plus, Trash, UserPlus } from "lucide-react";
import { Fragment } from "react";
import { formatEur } from "@/utils/utils";
import PricingModal from "./-components/pricing-modal";
import TariffConfigModal from "./-components/tariff-config-modal";
import TariffCustomerModal from "./-components/tariff-customer-modal";
import TariffProductsModal from "./-components/tariff-products-modal";
import type { Tariff } from "@/types";

export const Route = createFileRoute("/_main/products/pricing")({
    component: RouteComponent,
});

interface OverrideTarget {
    tariffId: string;
    productOptions: { id: string; name: string }[];
    contractId: string;
    contractName: string;
    duration: number;
    min_quantity: number;
    max_quantity: number | null;
    price: number;
}

function tariffTitle(tariff: Tariff): string {
    if (tariff.products.length === 0) return "(keine Produkte)";
    return tariff.products.map((p) => p.name).join(" & ");
}

function RouteComponent() {
    const createModal = useModal();
    const overrideModal = useModal<OverrideTarget>();
    const productsModal = useModal<Tariff>();
    const configModal = useModal<string>();

    const { tariffs, deleteTariff, deleteConfig, deleteCustomerOverride, isDeletingCustomerOverride } = useTariffHook();

    return (
        <Fragment>
            <div className="grid gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Preise</h1>
                    <Button size="sm" onClick={() => createModal.open()}>
                        Erstellen <Plus className="size-4" />
                    </Button>
                </div>

                <div className="grid gap-3">
                    {tariffs.length === 0 && (
                        <p className="text-sm text-gray-500">
                            Noch keine Preistabellen angelegt.
                        </p>
                    )}

                    {tariffs.map((tariff) => (
                        <div key={tariff.id} className="bg-white border border-(--border) rounded-md overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
                                <p className="text-md text-gray-900">
                                    {tariffTitle(tariff)}
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button variant="secondary" size="sm" icon={<Plus className="size-3.5" />}
                                        onClick={() => configModal.open(tariff.id)}>
                                        Konfiguration
                                    </Button>

                                    <Button variant="ghost" size="sm" icon={<Pen className="size-3.5" />}
                                        iconOnly onClick={() => productsModal.open(tariff)} />

                                    <Button variant="ghost" size="sm" icon={<Trash className="size-3.5" />}
                                        iconOnly onClick={() => deleteTariff({ id: tariff.id })} />
                                </div>
                            </div>

                            {tariff.configs.length > 0 && (
                                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center px-4 py-1.5 border-b border-(--border) bg-(--page-bg)">
                                    <span className="text-caption text-gray-400">Vertrag</span>
                                    <span className="text-caption text-gray-400 text-center">Menge</span>
                                    <span className="text-caption text-gray-400 text-center">Laufzeit</span>
                                    <span className="text-caption text-gray-400 text-right">Preis</span>
                                    <span />
                                </div>
                            )}

                            {tariff.configs.map((config) => (
                                <div key={config.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center px-4 py-1 border-b border-(--border)">
                                    <Badge variant="generated">{config.contract?.name}</Badge>

                                    <p className="text-sm text-gray-600 text-center">
                                        {config.min_quantity}–{config.max_quantity ?? "∞"}
                                    </p>

                                    <p className="text-sm text-gray-600 text-center">
                                        {config.duration} Monate
                                    </p>

                                    <p className="text-sm font-medium text-gray-900 text-right">
                                        {formatEur(config.price)}
                                    </p>

                                    <div className="flex items-center justify-end">
                                        <Button variant="link" size="sm" icon={<UserPlus className="size-3.5" />}
                                            iconOnly disabled={tariff.products.length === 0} onClick={() =>
                                                overrideModal.open({
                                                    tariffId: tariff.id,
                                                    productOptions: tariff.products.map((p) => ({ id: p.id, name: p.name })),
                                                    contractId: config.contractId,
                                                    contractName: config.contract?.name ?? "",
                                                    duration: config.duration,
                                                    min_quantity: config.min_quantity,
                                                    max_quantity: config.max_quantity ?? null,
                                                    price: config.price,
                                                })
                                            }
                                        />

                                        <Button variant="link" size="sm" icon={<Trash className="size-3.5" />}
                                            iconOnly onClick={() => deleteConfig({ tariffId: tariff.id, configId: config.id })}
                                        />
                                    </div>
                                </div>
                            ))}

                            {tariff.customers.length > 0 && (
                                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center px-4 py-1.5 border-b border-(--border) bg-(--page-bg)">
                                    <span className="text-caption text-gray-400">Kunde-Override</span>
                                    <span className="text-caption text-gray-400 text-center">Menge</span>
                                    <span className="text-caption text-gray-400 text-center">Laufzeit</span>
                                    <span className="text-caption text-gray-400 text-right">Preis</span>
                                    <span />
                                </div>
                            )}
                            {tariff.customers.map((c) => (
                                <div key={c.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center px-4 py-1 border-b border-(--border)">
                                    <div className="flex gap-1">
                                        <Badge variant="generated">{c.contract?.name}</Badge>
                                        <Badge variant="draft">{c.customer?.companyName}</Badge>
                                    </div>

                                    <p className="text-sm text-gray-600 text-center">
                                        {c.min_quantity}–{c.max_quantity ?? "∞"}
                                    </p>
                                    <p className="text-sm text-gray-600 text-center">
                                        {c.duration} Monate
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 text-right">
                                        {formatEur(c.price)}
                                    </p>

                                    <div className="flex items-center justify-end">
                                        <Button variant="link" size="sm" icon={<Trash className="size-3.5" />}
                                            iconOnly onClick={async () =>
                                                deleteCustomerOverride({ tariffId: tariff.id, tariffCustomerId: c.id })
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {createModal.isOpen && (
                <PricingModal key={createModal.key} onClose={createModal.close} />
            )}

            {overrideModal.isOpen && overrideModal.data && (
                <TariffCustomerModal
                    key={overrideModal.key}
                    onClose={overrideModal.close}
                    tariffId={overrideModal.data.tariffId}
                    productOptions={overrideModal.data.productOptions}
                    contractId={overrideModal.data.contractId}
                    contractName={overrideModal.data.contractName}
                    duration={overrideModal.data.duration}
                    min_quantity={overrideModal.data.min_quantity}
                    max_quantity={overrideModal.data.max_quantity}
                    listPrice={overrideModal.data.price}
                />
            )}

            {productsModal.isOpen && productsModal.data && (
                <TariffProductsModal
                    key={productsModal.key}
                    onClose={productsModal.close}
                    tariff={productsModal.data}
                />
            )}

            {configModal.isOpen && configModal.data && (
                <TariffConfigModal
                    key={configModal.key}
                    onClose={configModal.close}
                    tariffId={configModal.data}
                />
            )}
        </Fragment>
    );
}
