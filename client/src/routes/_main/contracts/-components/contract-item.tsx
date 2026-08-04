import { Pen, Trash } from "lucide-react";

import type { Contract } from "@keepit/schemas";
import { Button } from "@/components";
import { useLocale } from "@/hooks";
import { useDeleteContract } from "@/hooks/contracts/contract-mutations";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/i18n-content";

interface ContractListItemProps {
  contract: Contract;
  onEdit: (contract: Contract) => void;
}

export default function ContractListItem({ contract, onEdit }: ContractListItemProps) {
  const locale = useLocale();

  const name = localized(contract.translations, locale, "name");
  const features = localized(contract.translations, locale, "features") || [];

  const { deleteContract, isDeletingContract } = useDeleteContract();

  return (
    <div className="bg-white border border-(--border) rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) bg-(--page-bg)">
        <p className="text-lg font-medium">{name}</p>
        <p className="text-xs font-light text-gray-500">
          {formatDate(contract.createdAt || "")}
        </p>
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
