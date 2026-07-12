import { useTranslation } from "react-i18next";
import { PageWidth } from "@/components";
import InvoiceList from "./-components/invoice-list";

export function InvoicePage() {
    const { t } = useTranslation();

    return (
        <PageWidth>
            <div className="grid gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
                        {t("section.invoices")}
                    </h1>
                </div>

                <InvoiceList />
            </div>
        </PageWidth>
    );
}
