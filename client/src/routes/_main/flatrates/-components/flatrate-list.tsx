import { useTranslation } from "react-i18next";
import FlatRateItem from "./flatrate-item";
import FlatRateModal from "./flatrate-modal";

import { ListPage } from "@/components";
import { useFlatRateHook, useModal } from "@/hooks";

export default function FlatRateList() {
  const { t } = useTranslation();
  const modal = useModal();
  const { flatRates, isPending, error, createFlatRate } = useFlatRateHook();

  return (
    <ListPage
      title={t("section.flatRates")}
      items={flatRates}
      isPending={isPending}
      error={error}
      keyOf={(item) => item.id}
      createLabel={t("button.create")}
      onCreate={() => modal.open()}
      renderItem={(item) => (
        <FlatRateItem item={item} />
      )}
    >
      {modal.isOpen && (
        <FlatRateModal
          key={modal.key}
          onClose={modal.close}
          submitFn={(value) => createFlatRate({ ...value })}
        />
      )}
    </ListPage>
  );
}
