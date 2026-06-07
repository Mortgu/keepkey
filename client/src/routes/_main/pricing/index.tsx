import { useLocale, useTariffHook } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import PricingListItem from "./-components/pricing-list-item";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_main/pricing/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  const { tariffs } = useTariffHook();

  return (
    <div className="grid gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">{t("section.pricing")}</h1>
      </div>

      {tariffs.map((tariff) => (
        <PricingListItem tariff={tariff} />
      ))}
    </div>
  );
}
