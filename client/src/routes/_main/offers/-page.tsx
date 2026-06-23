import { Fragment } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";

import OfferList from "./-components/offer-list";
import { PageWidth } from "@/components";

export function OfferPage() {
  const { t } = useTranslation();

  return (
    <PageWidth>
      <Fragment>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium">{t("section.offers")}</h1>
          </div>

          <OfferList />
        </div>
      </Fragment>
    </PageWidth>
  );
}
