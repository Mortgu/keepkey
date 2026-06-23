import { useTranslation } from "react-i18next";
import OrderList from "./-components/order-list";
import { PageWidth } from "@/components";

export function OrderPage() {
  const { t } = useTranslation();

  return (
    <PageWidth>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
            {t("section.orders")}
          </h1>
        </div>

        <OrderList />
      </div>
    </PageWidth>
  );
}
