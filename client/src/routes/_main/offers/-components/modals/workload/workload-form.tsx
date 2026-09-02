import { Pen } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { coordinatesFrom } from "@keepit/schemas";
import { useOfferModalContext } from "../offer-modal-context";
import type { PositionField } from "../offer-modal-policy";
import type { CreateOfferPositionInput } from "@keepit/schemas";
import type { OfferModalPositionValues } from "@/routes/_main/offers/-schemas/offer-modal-schema";
import type { SyntheticEvent } from "react";
import { Button, Checkbox, Input, NumberField, Select } from "@/components";
import {
    useCustomerPriceOverride,
    useLocale,
    usePositionPrice,
    useProducts,
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
 * Vertrag und Laufzeit stehen hier nicht mehr: sie gelten für das ganze
 * Angebot und werden im Kopf gewählt. Was hier offen ist, entscheidet die
 * Policy — im Angebot alles, in der Verlängerung das Produkt nicht.
 */
export default function WorkloadForm({ currentWorkload, cancelFn, saveFn }: Props) {
    const locale = useLocale();
    const { t } = useTranslation();
    const { policy, sourceOffer, header } = useOfferModalContext();
    const { products } = useProducts();
    const { setOverride } = useCustomerPriceOverride();

    const shows = (field: PositionField) => policy.positions.fields[field] !== "hidden";
    const locked = (field: PositionField) => policy.positions.fields[field] === "readonly";

    const [workload, setWorkload] = useState<string>(currentWorkload?.productId || products[0]?.id || "");

    const [quantity, setQuantity] = useState<number>(currentWorkload?.quantity || 1);

    const [freeMonths, setFreeMonths] = useState<number>(currentWorkload?.free_months || 0);

    const [optional, setOptional] = useState<boolean>(currentWorkload?.optional || false);

    const [editingPrice, setEditingPrice] = useState<boolean>(false);
    const [overrideEur, setOverrideEur] = useState<string>("");
    const [error, setError] = useState<string>("");

    const coordinates = coordinatesFrom(header, {
        productId: workload,
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

    const canOverride = Boolean(header.customerId) && !locked("unitPrice");

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
                    <Select
                        label="Workload"
                        value={workload}
                        disabled={locked("productId")}
                        onValueChange={setWorkload}
                        options={products.map(product => ({
                            value: product.id,
                            label: localized(product.translations, locale, "name"),
                        }))}
                    />
                )}

                {/* Quantity */}
                {shows("quantity") && (
                    <NumberField
                        step={1}
                        label={t("offerModal.quantity")}
                        value={quantity}
                        disabled={locked("quantity")}
                        onValueChange={(value) => setQuantity(value ?? 0)}
                    />
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
                    <NumberField
                        step={1}
                        min={0}
                        max={header.duration_months}
                        label={t("offerModal.free_months")}
                        value={freeMonths}
                        disabled={locked("free_months")}
                        onValueChange={(value) => setFreeMonths(value ?? 0)}
                    />

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
