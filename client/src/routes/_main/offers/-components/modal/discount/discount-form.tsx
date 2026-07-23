import { Button, Input, Textarea } from "@/components";
import type { CreateOfferDiscountInput } from "@keepit/schemas";
import { useState, type SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";

const eurToCents = (eur: number): number => Math.round(eur * 100);

interface Props {
    currentDiscount?: CreateOfferDiscountInput;
    saveFn: (discount: CreateOfferDiscountInput) => void;
    cancelFn: () => void;
}

export default function DiscountFormOfferModal({ currentDiscount, saveFn, cancelFn }: Props) {
    const { t } = useTranslation();

    const [title, setTitle] = useState(currentDiscount?.title ?? "");
    const [amountEur, setAmountEur] = useState<number>(
        currentDiscount?.amount_cents ? (currentDiscount.amount_cents / 100) : 0);
    const [description, setDescription] = useState(currentDiscount?.description ?? "");
    const [error, setError] = useState("");

    const handleSave = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (!title.trim()) {
            setError("Titel erforderlich.");
            return;
        }

        saveFn({
            title: title.trim(),
            description: description.trim() || undefined,
            amount_cents: eurToCents(amountEur),
        });
        cancelFn();
    };

    return (
        <div className="w-full grid gap-3 p-4">
            <div className="grid items-end gap-4">

                <div className="flex items-center gap-4">
                    <Input label="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Input label="Rabatt" type="number" step="0.01" min="0" placeholder="Bsp. 390.00"
                        value={amountEur} onChange={(e) => {
                            const value = Number(e.target.value);
                            if (isNaN(value)) return;
                            setAmountEur(value);
                        }} />
                </div>

                <Textarea label="Tabelle" value={description} onChange={(e) => setDescription(e.target.value)} />

            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex items-center justify-between border-t border-(--border) pt-4">
                <div className="flex items-center gap-4" />

                <div className="flex items-center gap-4">
                    <Button type="button" variant="border" size="sm" onClick={cancelFn}>
                        {t("button.cancel")}
                    </Button>

                    <Button type="button" variant="primary" size="sm" onClick={handleSave}>
                        {t("button.save")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
