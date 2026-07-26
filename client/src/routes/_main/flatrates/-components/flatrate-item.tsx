import { Button } from "@/components";
import { useDeleteFlatRate, useLocale, useModal, useUpdateFlatRate } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { Flatrate } from "@keepit/schemas";
import { Pen, Trash } from "lucide-react";
import FlatRateModal from "./flatrate-modal";


export default function FlatRateItem({ item }: { item: Flatrate }) {
  const { deleteFlatRate, isDeletingFlatRate } = useDeleteFlatRate();
  const { updateFlatRate } = useUpdateFlatRate();

  const modal = useModal<Flatrate>();
  const locale = useLocale();

  return (
    <>
      <div className="bg-(--page-bg) border border-(--border) rounded-md overflow-hidden">
        <div className="flex flex-wrap items-center justify-between ">
          <div className="px-4 py-3 gap-4">
            <p className="text-md font-normal">{localized(item.translations, locale, "name")}</p>
            <p className="text-md font-light text-gray-500">
              {localized(item.translations, locale, "table")}
            </p>
          </div>
          <div className="flex items-center justify-between w-full px-4 py-2 gap-4 bg-white border-t border-(--border)">

            <div className="flex items-center gap-2 text-sm text-gray-500 mr-2">
              <span>Gesamt: </span>
              <span className="text-gray-900 font-medium font-mono">
                {(item.total_cents / 100).toFixed(2)} €
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="xs" icon={<Pen size={14} />}
                iconOnly onClick={() => modal.open(item)} />

              <Button variant="secondary" danger size="xs" loading={isDeletingFlatRate}
                icon={<Trash size={14} />} iconOnly
                onClick={() => deleteFlatRate(item.id)} />

            </div>
          </div>
        </div>
      </div>

      {modal.isOpen && (
        <FlatRateModal
          key={modal.key}
          onClose={modal.close}
          submitFn={(value) => updateFlatRate({ id: item.id, flatRate: value })}
          currentItem={{ total_cents: item.total_cents, translations: item.translations }}
        />
      )}
    </>
  );
}
