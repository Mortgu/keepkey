import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { DiscountItemState } from "./discount.derived-modal";
import { Button, Input, Textarea } from "@/components";
import { eurToCents, formatEur } from "@/utils/utils";

interface Props {
    item: DiscountItemState;
    saveFn: (updated: { title: string; description?: string; amount_cents: number }) => void;
    closeFn: () => void;
}

export default function DiscountItemFormDerivedModal({ item, saveFn, closeFn }: Props) {
    const { t } = useTranslation();

    const [title, setTitle] = useState(item.title);
    const [amountEur, setAmountEur] = useState<number>(item.amount_cents / 100);
    const [description, setDescription] = useState(item.description ?? "");
    const [error, setError] = useState("");

    const save = () => {
        if (!title.trim()) {
            setError("Titel erforderlich.");
            return;
        }
        saveFn({
            title: title.trim(),
            description: description.trim() || undefined,
            amount_cents: eurToCents(amountEur),
        });
        closeFn();
    };

    return (
        <div className="grid gap-4 border-t border-(--border) p-4">
            <div className="flex items-center gap-4">
                <Input label="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Input
                    label="Rabatt"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Bsp. 390.00"
                    value={amountEur}
                    onChange={(e) => {
                        const value = Number(e.target.value);
                        if (isNaN(value)) return;
                        setAmountEur(value);
                    }}
                />
            </div>
            <Textarea label="Tabelle" value={description} onChange={(e) => setDescription(e.target.value)} />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <hr className="text-(--border)" />
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-md font-light text-gray-400">{t("renewal.total")}:</span>
                        <p className="text-md font-mono font-normal">{formatEur(eurToCents(amountEur))}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="xs" variant="border" onClick={closeFn}>
                        {t("button.cancel")}
                    </Button>
                    <Button size="xs" variant="primary" onClick={save}>
                        {t("button.save")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
