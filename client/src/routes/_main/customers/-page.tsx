import { PageWidth } from "@/components";
import { useTranslation } from "react-i18next";
import { default as CustomerList } from "./-components/customer-list";

export default function CustomerPage() {
    const { t } = useTranslation();

    return (
        <PageWidth variant="none">
            <div className="p-4 border-b border-(--border) ">
                <h1 className="text-lg font-semibold">{t("section.customers")}</h1>
            </div>

            <CustomerList />
        </PageWidth>
    );
}
