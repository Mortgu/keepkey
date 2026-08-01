import { useTranslation } from "react-i18next";
import { default as CustomerList } from "./-components/customer-list";
import { PageWidth } from "@/components";

export default function CustomerPage() {
    const { t } = useTranslation();

    return (
        <PageWidth className="h-fit grid gap-4">
            <div className="grid gap-4">
                <h1 className="text-xl font-medium">{t("section.customers")}</h1>
            </div>

            <CustomerList />
        </PageWidth>
    );
}
