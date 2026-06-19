import { Pen, Trash } from "lucide-react";
import FlatRateModal from "./flatrate-modal";
import type { FlatRate, UpdateFlatRateInput } from "@/types";
import { useFlatRateHook, useLocale, useModal } from "@/hooks";
import { Button } from "@/components";
import { localized } from "@/lib/i18n-content";

export default function FlatRateItem({ item }: { item: FlatRate }) {
  const { updateFlatRate, deleteFlatRate, isDeletingFlatRate } = useFlatRateHook();
  const modal = useModal<FlatRate>();
  const locale = useLocale();

  return (
    <>
      <div className="bg-white border border-(--border) rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-md text-gray-900">{localized(item.translations, locale, "name")}</p>
            <p className="text-sm font-light text-gray-400 mt-0.5">
              {localized(item.translations, locale, "table")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-500 mr-2">
              <span>
                Gesamt:{" "}
                <span className="text-gray-900 font-medium">
                  {(item.total_cents / 100).toFixed(2)} €
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" icon={<Pen className="size-3.5" />}
                iconOnly onClick={() => modal.open(item)} />
              <Button variant="ghost" size="sm" loading={isDeletingFlatRate}
                icon={<Trash className="size-3.5" />} iconOnly
                onClick={() => deleteFlatRate(item.id)} />
            </div>
          </div>
        </div>
      </div>

      {modal.isOpen && (
        <FlatRateModal
          key={modal.key}
          onClose={modal.close}
          submitFn={(value: UpdateFlatRateInput) => updateFlatRate({ id: item.id, flatrate: value })}
          currentItem={{ key: item.key, total_cents: item.total_cents, translations: item.translations }}
        />
      )}
    </>
  );
}
