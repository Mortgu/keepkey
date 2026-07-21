import { PageWidth } from "@/components";
import { useModal } from "@/hooks";
import type { Customer } from "@/types";
import { useTranslation } from "react-i18next";
import { default as CustomerList } from "./-components/customer-list";
import useCustomerFilters from "./-hooks/use-customer-filters";


const countryFilterOptions = [
    { value: "Deutschland", label: "Deutschland" },
    { value: "Schweiz", label: "Schweiz" },
    { value: "Südafrika", label: "Südafrika" },
];

const languageFilterOptions = [
    { value: "DE", label: "Deutsch" },
    { value: "EN", label: "English" },
];

export default function CustomerPage() {
    const { t } = useTranslation();
    const filters = useCustomerFilters();

    const modal = useModal<Customer>();

    return (
        <PageWidth variant="none">
            <div className="p-4 border-b border-(--border) ">
                <h1 className="text-lg font-semibold">{t("section.customers")}</h1>
            </div>

            <CustomerList />
        </PageWidth>
    );
}
