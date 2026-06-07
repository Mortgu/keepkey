import { Fragment } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";

import OfferList from "./-components/offer-list";

export function OfferPage() {
  const { t } = useTranslation();

  return (
    <Fragment>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium">{t("section.offers")}</h1>
        </div>

        <OfferList />
      </div>
    </Fragment>
  );
}
