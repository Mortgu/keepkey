import { useTranslation } from "react-i18next";

import TemplateList from "./-components/template-list";
import { Breadcrumbs } from "@/components";

export default function TemplatePage() {
    const { t } = useTranslation();

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: t("section.templates"), to: "/templates" },
                    ]}
                />
            </div>

            <TemplateList />
        </div>
    )
}
