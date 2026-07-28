import { Button, Input, Textarea } from "@/components";
import type { RenewalFormApi } from "../hook/use-renewal-form";
import { useStore } from "@tanstack/react-form";
import { formatEur } from "@/utils/utils";
import { useTranslation } from "react-i18next";

interface Props {
    form: RenewalFormApi;
    index: number;
    closeFn: () => void;
}

export default function DiscountItemFormRenwalModal({ form, index, closeFn }: Props) {
    const { t } = useTranslation();

    const discount = useStore(form.store, (s) => s.values.discounts[index]);

    return (
        <div className="grid gap-4 border-t border-(--border) p-4">
            <div className="flex items-center gap-4">
                <Input label="Title" value={discount.title} />
                <Input label="Total" value={formatEur(discount.amount_cents)} />
            </div>
            <Textarea label="Beschreibung" value={discount.description} />

            <hr className="text-(--border)" />
            <div className="flex items-center justify-between gap-4">
                <div></div>
                <div className="flex items-center gap-2">
                    <Button size="xs" variant="border" onClick={closeFn}>
                        {t("button.cancel")}
                    </Button>
                    <Button size="xs" variant="primary">
                        {t("button.save")}
                    </Button>
                </div>
            </div>
        </div>
    )
}
