import { useTranslation } from "react-i18next";
import { PageWidth } from "@/components";

export function TextsPage() {
    const { t } = useTranslation();
    return (
        <PageWidth>
            <h1 className="text-2xl font-medium">{t("section.textBlocks")}</h1>
        </PageWidth>
    );
}
