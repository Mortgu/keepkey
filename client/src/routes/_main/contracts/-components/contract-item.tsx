import { Pen, Trash } from "lucide-react";
import { Fragment } from "react";
import ContractModal from "./contract-modal";

import { Button } from "@/components";
import { useLocale, useModal } from "@/hooks";
import { useDeleteContract } from "@/hooks/contracts/contract-mutations";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/i18n-content";
import type { Contract } from "@keepit/schemas";

interface ContractListItemProps {
  contract: Contract;
}

export default function ContractListItem({ contract }: ContractListItemProps) {
  const modal = useModal<Contract>();
  const locale = useLocale();

  const name = localized(contract.translations, locale, "name");
  const features = localized(contract.translations, locale, "features") || [];

  const { deleteContract, isDeletingContract } = useDeleteContract();

  return (
    <Fragment>
      <div className="bg-white border border-(--border) rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) bg-(--page-bg)">
          <div>
            <p className="text-md text-(--text)">{name}</p>
            <p className="text-xs text-gray-400">
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

        <div className="flex items-center justify-between px-2 py-2 border-t border-(--border)">
          {/* Actions left */}
          <div className="flex items-center gap-2"></div>
          {/* Actions right */}
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="xs" icon={<Pen size={14} />} iconOnly
              onClick={() => modal.open(contract)} />

            <Button variant="secondary" size="xs" danger icon={<Trash size={14} />} iconOnly
              onClick={() => deleteContract({ id: contract.id })} loading={isDeletingContract} disabled={isDeletingContract} />
          </div>
        </div>
      </div>

      {modal.isOpen && (
        <ContractModal key={modal.key} onClose={modal.close} currentContract={modal.data} />
      )}
    </Fragment>
  );
}
