import { Check, Pen, Tag } from "lucide-react";
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
import { ApiError } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
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
    const { setOverride, clearOverride, isPending: overridePending } = useCustomerPriceOverride();

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

    const {
        unitCents, isCustomerPrice, listUnitCents,
        isLoading: pricePending, error: priceError,
    } = usePositionPrice({
        source: policy.priceSource,
        coordinates,
        pin: sourceOffer
            ? { offerId: sourceOffer.id, positionId: currentWorkload?.sourcePositionId ?? null }
            : undefined,
    });

    // Ohne hinterlegten Preis zeigt das Feld die Ursache statt "0,00 €" — ein
    // Nullpreis saehe aus wie ein Ergebnis.
    const priceMessage = priceError ? getErrorMessage(priceError) : null;

    /**
     * Ein Kundenpreis haengt an einem Tarif. Fehlt der ganz (Produkt in keiner
     * Tarifgruppe), gibt es nichts zu ueberschreiben — bei jeder anderen Ursache
     * behebt das Setzen den Fehler, weil ein Kundenpreis selbst ein Preis ist.
     */
    const noTariff = priceError instanceof ApiError && priceError.code === "NO_TARIFF";
    const canOverride = Boolean(header.customerId) && !locked("unitPrice") && !noTariff;

    const startEditPrice = () => {
        setOverrideEur(priceMessage ? "" : (unitCents / 100).toString());
        setEditingPrice(true);
    };

    const toggleEditPrice = () => {
        if (editingPrice) {
            setEditingPrice(false);
        } else {
            startEditPrice();
        }
    };

    /**
     * Der Kundenpreis wird sofort geschrieben, nicht erst mit der Position: er
     * ist eine eigene, dauerhafte Groesse und haengt nicht am Angebot. Frueher
     * lief er ueber `handleSave` mit — und war damit genau dann unerreichbar,
     * wenn er gebraucht wurde, weil ein fehlender Preis das Uebernehmen sperrt.
     */
    const commitOverride = async () => {
        const parsed = Number(overrideEur.replace(",", "."));

        if (isNaN(parsed) || parsed < 0) {
            setError("Ungültiger Preis.");
            return;
        }

        setError("");

        try {
            await setOverride({ coordinates, unitPriceCents: eurToCents(parsed) });
            setEditingPrice(false);
        } catch (exception: unknown) {
            setError(getErrorMessage(exception));
        }
    };

    const resetOverride = async () => {
        setError("");

        try {
            await clearOverride(coordinates);
            setEditingPrice(false);
        } catch (exception: unknown) {
            setError(getErrorMessage(exception));
        }
    };

    const handleSave = (event: SyntheticEvent<HTMLButtonElement>) => {
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

        saveFn(data);
        cancelFn();
    };

    const displayUnitPrice = editingPrice
        ? overrideEur
        : priceMessage
            ? ""
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
                    <div className="grid gap-1">
                        <Input
                            label={t("offerModal.unit_price")}
                            error={priceMessage ? t("offerModal.no_price") : undefined}
                            errorTooltip={priceMessage ?? undefined}
                            loading={pricePending}
                            type={editingPrice ? "number" : "text"}
                            step={editingPrice ? "0.01" : undefined}
                            min={editingPrice ? "0" : undefined}
                            value={displayUnitPrice}
                            disabled={!editingPrice}
                            onChange={(e) => setOverrideEur(e.target.value)}
                            /* Im Bearbeiten bestaetigt der Haken und schreibt
                               sofort; sonst oeffnet der Stift. Ohne Tarif gibt
                               es nichts zu ueberschreiben. */
                            rightButton={canOverride ? (editingPrice ? {
                                icon: <Check size={12} />,
                                variant: "primary",
                                type: "button",
                                onClick: () => void commitOverride(),
                            } : {
                                icon: <Pen size={12} />,
                                variant: "border",
                                type: "button",
                                onClick: toggleEditPrice,
                            }) : undefined}
                        />

                        {/* Herkunft des Betrags. Ohne sie ist einem Preis nicht
                            anzusehen, ob er ausgehandelt oder Listenpreis ist. */}
                        {!editingPrice && isCustomerPrice && (
                            <p className="flex items-center gap-1.5 text-xs text-(--text-secondary)">
                                <Tag size={11} />
                                {t("offerModal.customer_price")}
                                {listUnitCents !== null && (
                                    <span>({t("offerModal.list_price")} {formatEur(listUnitCents)})</span>
                                )}
                                <Button
                                    variant="link"
                                    size="xs"
                                    disabled={overridePending}
                                    onClick={() => void resetOverride()}
                                >
                                    {t("offerModal.reset_price")}
                                </Button>
                            </p>
                        )}

                        {!editingPrice && !isCustomerPrice && noTariff && (
                            <p className="text-xs text-(--text-secondary)">
                                {t("offerModal.no_tariff_hint")}
                            </p>
                        )}
                    </div>
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

                    {/* Eine Position, die sich nicht bepreisen laesst, wird gar
                        nicht erst uebernommen — sonst stuende sie mit 0,00 €
                        im Angebot. */}
                    <Button type="button" variant="primary" size="sm" onClick={handleSave}
                        disabled={pricePending || Boolean(priceMessage)}
                        title={priceMessage ?? undefined}>
                        {t("button.save")}
                    </Button>
                </div>
            </div>
        </div >
    )
}
