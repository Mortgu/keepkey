import { Pen, Trash } from "lucide-react";
import { Fragment } from "react";
import ContractModal from "./contract-modal";

import type { Contract } from "@/types";
import { formatDate } from "@/lib/format";
import { Button } from "@/components";
import { useLocale, useModal } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { useDeleteContract } from "@/hooks/contracts/contract-mutations";

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
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
          <div>
            <p className="text-md text-(--text)">{name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(contract.createdAt || "")}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" icon={<Pen className="size-3.5" />} iconOnly
              onClick={() => modal.open(contract)} />

            <Button variant="ghost" size="sm" icon={<Trash className="size-3.5" />} iconOnly
              onClick={() => deleteContract({ id: contract.id })} loading={isDeletingContract} disabled={isDeletingContract} />
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
          </ul>
        </div>
      </div>

      {modal.isOpen && (
        <ContractModal key={modal.key} onClose={modal.close} currentContract={modal.data} />
      )}
    </Fragment>
  );
}
