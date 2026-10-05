import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pen, Trash } from "lucide-react";

import type { Contract } from "@keepit/schemas";
import { Button } from "@/components";
import { useLocale } from "@/hooks";
import { useDeleteContract } from "@/hooks/contracts/contract-mutations";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/i18n-content";

interface ContractListItemProps {
  contract: Contract;
  /** Erster Tarif der Liste — wird bei neuen Angeboten vorausgewählt. */
  isDefault: boolean;
  onEdit: (contract: Contract) => void;
}

export default function ContractListItem({ contract, isDefault, onEdit }: ContractListItemProps) {
  const locale = useLocale();

  const name = localized(contract.translations, locale, "name");
  const features = localized(contract.translations, locale, "features") || [];

  const { deleteContract, isDeletingContract } = useDeleteContract();

  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging,
  } = useSortable({ id: contract.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative bg-white border border-(--border) rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden ${isDragging ? "z-10 opacity-80 shadow-lg" : ""}`}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-(--border) bg-(--page-bg)">
        {/* Nur der Griff startet das Ziehen, damit die Buttons klickbar bleiben. */}
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`${name} verschieben`}
          className="-ml-1 p-1 rounded text-gray-400 hover:text-(--text) hover:bg-gray-100 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={16} />
        </button>

        <div className="grid flex-1">
          <div className="flex items-center gap-2">
            <p className="text-md font-medium">{name}</p>
            {isDefault && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
                Standard
              </span>
            )}
          </div>
          <p className="text-sm font-light text-gray-500">
            {formatDate(contract.createdAt || "")}
          </p>
        </div>
      </div>

      <div className="px-4 py-3.5">
        <ul className="flex flex-col gap-1.5">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-(--text) leading-snug">
              <span className="w-1.25 h-1.25 rounded-full bg-(--text) shrink-0 mt-1.5" />
              {feature}
            </li>
          ))}

          {features.length === 0 && (
            <p className="text-sm text-(--destructive)">Keine Features hinterlegt!</p>
          )}
        </ul>
      </div>

      <div className="flex items-center justify-end px-2 py-2 border-t border-(--border)">
        {/* Actions right */}
        <div className="flex items-center gap-2">
          <Button
            variant="border"
            size="sm"
            icon={<Pen size={14} />}
            iconOnly
            onClick={() => onEdit(contract)}
          />

          <Button
            variant="border"
            size="sm"
            icon={<Trash size={14} />}
            iconOnly
            onClick={() => deleteContract({ id: contract.id })}
            loading={isDeletingContract} disabled={isDeletingContract}
          />
        </div>
      </div>
    </div>
  );
}
