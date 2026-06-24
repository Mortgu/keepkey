import {createFileRoute} from "@tanstack/react-router";
import {useTranslation} from "react-i18next";
import {PageWidth} from "@/components";

export const Route = createFileRoute("/_main/workloads/texts")({
    component: () => {
        const {t} = useTranslation();
        return (
            <PageWidth>
                <h1 className="text-2xl font-medium">{t("section.textBlocks")}</h1>
            </PageWidth>
        );
    },
});
