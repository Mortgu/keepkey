import { useTranslation } from "react-i18next";
import InvoiceList from "./-components/invoice-list";
import { Breadcrumbs } from "@/components";

export function InvoicePage() {
    const { t } = useTranslation();

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: t("section.invoices"), to: "/invoices" },
                    ]}
                />
            </div>

            {/* Die Rechnungsliste bringt ihre Filterzeile und den Erstellen-Knopf
                selbst mit — anders als die übrigen Listen. */}
            <InvoiceList />
        </div>
    );
}
