import { Pen } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {  coordinatesFrom } from "@keepit/schemas";
import { useOfferModalContext } from "../offer-modal-context";
import type { PositionField } from "../offer-modal-policy";
import type {CreateOfferPositionInput} from "@keepit/schemas";
import type { OfferModalPositionValues } from "@/routes/_main/offers/-schemas/offer-modal-schema";
import type { SyntheticEvent } from "react";
import { Button, Checkbox, Input, Select } from "@/components";
import {
    useContracts,
    useCustomerPriceOverride,
    useLocale,
    usePositionPrice,
    useProducts,
    useTariffDurationsHook,
} from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { eurToCents, formatEur } from "@/utils/utils";

interface Props {
    currentWorkload?: OfferModalPositionValues;
    cancelFn: () => void;
    saveFn: (values: CreateOfferPositionInput) => void;
}

/**
 * Anlegen und Bearbeiten einer Position.
 *
 * Welche Felder offen sind, entscheidet die Policy: Im Angebot alle, in der
 * Verlängerung alles ausser Produkt und Vertrag, in der Erweiterung nur die
 * Menge — dort bestimmen Produkt, Vertrag und Laufzeit die Spalte in der
 * angepinnten Preistabelle und dürfen sich nicht verschieben.
 */
export default function WorkloadForm({ currentWorkload, cancelFn, saveFn }: Props) {
    const locale = useLocale();
    const { t } = useTranslation();
    const { policy, sourceOffer, customerId } = useOfferModalContext();
    const { products } = useProducts();
    const { contracts } = useContracts();
    const { setOverride } = useCustomerPriceOverride();

    const shows = (field: PositionField) => policy.positions.fields[field] !== "hidden";
    const locked = (field: PositionField) => policy.positions.fields[field] === "readonly";

    const [workload, setWorkload] = useState<string>(currentWorkload?.productId || products[0]?.id || "");
    const [contract, setContract] = useState<string>(currentWorkload?.contractId || contracts[0]?.id || "");

    const { durations } = useTariffDurationsHook(workload, contract);

    const [duration, setDuration] = useState<number>(currentWorkload?.duration_months || 0);
    // Reset duration when the available durations change (workload/contract switch).
    // React-recommended render-phase reset instead of setState-in-effect.
    const [prevDurations, setPrevDurations] = useState(durations);
    if (!locked("duration_months") && durations !== prevDurations) {
        setPrevDurations(durations);
        setDuration(currentWorkload?.duration_months && durations.includes(currentWorkload.duration_months)
            ? currentWorkload.duration_months
            : durations[0] || 0);
    }

    const [quantity, setQuantity] = useState<number>(currentWorkload?.quantity || 1);

    const [freeMonths, setFreeMonths] = useState<number>(currentWorkload?.free_months || 0);

    const [optional, setOptional] = useState<boolean>(currentWorkload?.optional || false);

    const [editingPrice, setEditingPrice] = useState<boolean>(false);
    const [overrideEur, setOverrideEur] = useState<string>("");
    const [error, setError] = useState<string>("");

    const coordinates = coordinatesFrom(customerId, {
        productId: workload,
        contractId: contract,
        duration_months: duration,
        quantity,
        free_months: freeMonths,
    });

    const { unitCents, isLoading: pricePending } = usePositionPrice({
        source: policy.priceSource,
        coordinates,
        pin: sourceOffer
            ? { offerId: sourceOffer.id, positionId: currentWorkload?.sourcePositionId ?? null }
            : undefined,
    });

    const canOverride = Boolean(customerId) && !locked("unitPrice");

    const startEditPrice = () => {
        setOverrideEur((unitCents / 100).toString());
        setEditingPrice(true);
    };

    const toggleEditPrice = () => {
        if (editingPrice) {
            setEditingPrice(false);
        } else {
            startEditPrice();
        }
    };

    const handleSave = async (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const data: CreateOfferPositionInput = {
            productId: workload,
            contractId: contract,
            duration_months: duration,
            quantity,
            free_months: freeMonths,
            optional,
            total_cents: 0,
            eur_user_month: 0,
            discount_cents: 0,
        };

        try {
            if (editingPrice && canOverride) {
                const parsed = Number(overrideEur.replace(",", "."));
                if (isNaN(parsed) || parsed < 0) {
                    setError("Ungültiger Preis.");
                    return;
                }
                await setOverride({ coordinates, unitPriceCents: eurToCents(parsed) });
            }

            saveFn(data);
            cancelFn();
        } catch (exception: unknown) {
            setError(exception instanceof Error ? exception.message : "Preis konnte nicht gespeichert werden.");
        }
    };

    const displayUnitPrice = editingPrice
        ? overrideEur
        : formatEur(unitCents);

    return (
        <div className="w-full grid gap-3 p-4">
            <div className="flex items-end gap-3">

                {/* Workloads */}
                {shows("productId") && (
                    <Select label="Workload" value={workload} disabled={locked("productId")}
                        onChange={(e) => setWorkload(e.target.value)}>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>
                                {localized(product.translations, locale, "name")}
                            </option>
                        ))}
                    </Select>
                )}

                {/* Contracts */}
                {shows("contractId") && (
                    <Select label="Contract" value={contract} disabled={locked("contractId")}
                        onChange={(e) => setContract(e.target.value)}>
                        {contracts.map(ctr => (
                            <option key={ctr.id} value={ctr.id}>
                                {localized(ctr.translations, locale, "name")}
                            </option>
                        ))}
                    </Select>
                )}

                {/* Runtime — gesperrt als Klartext, weil die Laufzeit der
                    Quellposition nicht zwingend in den heutigen Staffeln steht. */}
                {shows("duration_months") && (
                    locked("duration_months") ? (
                        <Input label="Runtime" value={`${duration} ${t("common.months")}`} disabled readOnly />
                    ) : (
                        <Select label="Runtime" value={duration} onChange={(e) => setDuration(Number(e.target.value))} disabled={durations.length === 0}>
                            {durations.length === 0 && (
                                <option value={0}>Keine Laufzeit definiert!</option>
                            )}

                            {durations.map(dur => (
                                <option key={dur} value={dur}>{dur} {t("common.months")}</option>
                            ))}
                        </Select>
                    )
                )}

                {/* Quantity */}
                {shows("quantity") && (
                    <Input type="text" label={t("offerModal.quantity")} value={quantity} disabled={locked("quantity")}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />
                )}

            </div>

            <div className="flex items-end gap-3">
                {shows("unitPrice") && (
                    <Input
                        label={t("offerModal.unit_price")}
                        loading={pricePending}
                        type={editingPrice ? "number" : "text"}
                        step={editingPrice ? "0.01" : undefined}
                        min={editingPrice ? "0" : undefined}
                        value={displayUnitPrice}
                        disabled={!editingPrice}
                        onChange={(e) => setOverrideEur(e.target.value)}
                        rightButton={canOverride ? {
                            icon: <Pen size={12} />,
                            variant: "border",
                            type: "button",
                            onClick: toggleEditPrice,
                        } : undefined}
                    />
                )}

                {shows("free_months") && (
                    <Input label={t("offerModal.free_months")} value={freeMonths} disabled={locked("free_months")}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            if (isNaN(value)) return;
                            setFreeMonths(value);
                        }} />
                )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {/* Footer actions */}
            <div className="flex items-center justify-between border-t border-(--border) pt-4">
                {/* left */}
                <div className="flex items-center gap-4">
                    {shows("optional") && (
                        <Checkbox label="Optional?" checked={optional}
                            onChange={() => setOptional(!optional)} />
                    )}
                </div>

                {/* right */}
                <div className="flex items-center gap-4">
                    <Button type="button" variant="border" size="sm" onClick={cancelFn}>
                        {t("button.cancel")}
                    </Button>

                    <Button type="button" variant="primary" size="sm" onClick={handleSave} disabled={pricePending}>
                        {t("button.save")}
                    </Button>
                </div>
            </div>
        </div >
    )
}
