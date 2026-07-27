import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import RenewalPositionRow from "./renewal-position-row";
import type { RenewalPositionValue } from "./renewal-position-row";
import type { Order } from "@keepit/schemas";
import { Button, Input, ModalDialog, Select, showToast } from "@/components";
import { useFlatRates, useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";

interface Props {
    order: Order;
    onClose: () => void;
}

type FlatRateValue = {
    key: string;
    flatRateId: string;
    quantity: number;
    total_cents: number;
};

const inputDate = (value?: string) => value?.slice(0, 10) ?? "";

const addMonths = (date: string, months: number): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
};

const maxDuration = (durations: Array<number>): number =>
    durations.reduce((a, b) => Math.max(a, b), 0);

export default function RenewalModal({ order, onClose }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();
    const { flatRates: availableFlatRates } = useFlatRates();

    const defaultStart = useMemo(() => {
        const base = order.validUntil ? inputDate(order.validUntil) : inputDate(order.date);
        return base || new Date().toISOString().slice(0, 10);
    }, [order.validUntil, order.date]);

    const maxPosDuration = useMemo(
        () => maxDuration(order.orderPositions.map((p) => p.duration_months)),
        [order.orderPositions],
    );

    const [startDate, setStartDate] = useState(defaultStart);
    const [validUntil, setValidUntil] = useState(addMonths(defaultStart, maxPosDuration || 12));

    const [positions, setPositions] = useState<Array<RenewalPositionValue>>(() =>
        order.orderPositions.map((position) => ({
            key: position.id,
            productId: position.productId,
            contractId: position.contractId,
            duration_months: position.duration_months,
            quantity: position.quantity,
            free_months: 0,
            optional: position.optional ?? false,
            total_cents: 0,
            eur_user_month: 0,
            discount_cents: 0,
        })),
    );

    const [flatRates, setFlatRates] = useState<Array<FlatRateValue>>(() =>
        order.flatRates.map((flatRate) => ({
            key: flatRate.id,
            flatRateId: flatRate.flatRateId,
            quantity: flatRate.quantity,
            total_cents: flatRate.total_cents,
        })),
    );

    const updatePosition = (next: RenewalPositionValue) => {
        setPositions((current) => current.map((item) => (item.key === next.key ? next : item)));
    };

    const updateFlatRate = (key: string, patch: Partial<FlatRateValue>) => {
        setFlatRates((current) =>
            current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
        );
    };

    const handleSubmit = () => {
        showToast.info("orders.toast.renewalStub");
        onClose();
    };

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">{t("renewal.title", { orderId: order.orderId })}</h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <div className="grid gap-5">
                    <section className="grid gap-3">
                        <h2 className="text-sm font-semibold text-(--text-secondary)">
                            {t("renewal.period_section")}
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label={t("renewal.start_date")}
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <Input
                                label={t("renewal.valid_until")}
                                type="date"
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                            />
                        </div>
                    </section>

                    <section className="grid gap-3">
                        <h2 className="text-sm font-semibold text-(--text-secondary)">
                            {t("renewal.positions_section")}
                        </h2>
                        {positions.map((value) => (
                            <RenewalPositionRow
                                key={value.key}
                                customerId={order.customerId}
                                position={order.orderPositions.find((p) => p.id === value.key)!}
                                value={value}
                                onChange={updatePosition}
                            />
                        ))}
                    </section>

                    <section className="grid gap-3">
                        <h2 className="text-sm font-semibold text-(--text-secondary)">
                            {t("renewal.flatrates_section")}
                        </h2>
                        {flatRates.length === 0 && (
                            <p className="text-sm text-(--text-secondary)">—</p>
                        )}
                        {flatRates.map((flatRate) => {
                            return (
                                <div
                                    key={flatRate.key}
                                    className="grid grid-cols-[2fr_1fr_1fr] items-end gap-3 bg-(--subtle-50) border border-(--border) rounded-md p-3"
                                >
                                    <Select
                                        label={t("renewal.flatrates_section")}
                                        value={flatRate.flatRateId}
                                        onChange={(e) => {
                                            const selected = availableFlatRates.find(
                                                (item) => item.id === e.target.value,
                                            );
                                            updateFlatRate(flatRate.key, {
                                                flatRateId: e.target.value,
                                                total_cents:
                                                    (selected?.total_cents ?? 0) * flatRate.quantity,
                                            });
                                        }}
                                        options={availableFlatRates.map((item) => ({
                                            value: item.id,
                                            label: localized(item.translations, locale, "name"),
                                        }))}
                                    />
                                    <Input
                                        label={t("renewal.quantity")}
                                        type="number"
                                        min={1}
                                        value={flatRate.quantity}
                                        onChange={(e) => {
                                            const quantity = Math.max(1, Number(e.target.value));
                                            const unit =
                                                flatRate.quantity > 0
                                                    ? Math.round(
                                                          (flatRate.total_cents / flatRate.quantity) * quantity,
                                                      )
                                                    : 0;
                                            updateFlatRate(flatRate.key, { quantity, total_cents: unit });
                                        }}
                                    />
                                    <Input
                                        label={t("renewal.total")}
                                        type="number"
                                        value={flatRate.total_cents}
                                        onChange={(e) =>
                                            updateFlatRate(flatRate.key, {
                                                total_cents: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                            );
                        })}
                    </section>

                    <div className="flex items-center justify-end pt-2 text-sm">
                        <span className="text-(--text-secondary)">{t("renewal.total")}:</span>
                        <p className="ml-2 font-semibold">
                            {formatEur(
                                positions.reduce(
                                    (sum, p) => sum + (p.total_cents > 0 ? p.total_cents : 0),
                                    0,
                                ) + flatRates.reduce((sum, f) => sum + f.total_cents, 0),
                            )}
                        </p>
                    </div>
                </div>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button variant="border" size="sm" onClick={onClose}>
                    {t("button.cancel")}
                </Button>
                <Button variant="primary" size="sm" onClick={handleSubmit}>
                    {t("button.save")}
                </Button>
            </ModalDialog.Footer>
        </ModalDialog>
    );
}