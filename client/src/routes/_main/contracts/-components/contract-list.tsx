import { Loader, Plus } from "lucide-react";
import { useState } from "react";
import { useContractHook } from "@/hooks";
import ContractModal from "./contract-modal";
import ContractListItem from "./contract-item";

import type { Contract } from "@/types";
import { Button } from "@/components";

export default function ContractList() {
  const { contracts, isPending, error, deleteContract } = useContractHook();

  const [isOpen, setOpen] = useState<boolean>(false);

  if (isPending) {
    return <Loader className="animate-spin" />;
  }

  if (error) {
    return (
      <div className="p-2 bg-red-200 border border-red-400 rounded-lg">
        <p className="text-lg">Error</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
          Verträge ({contracts.length})
        </h1>
        <Button onClick={() => setOpen(true)} size="sm">
          Create <Plus className="size-4" />
        </Button>
      </div>
      <div className="grid gap-2">
        {contracts.map((contract: Contract, index) => (
          <ContractListItem
            key={index}
            contract={contract}
            deleteContract={deleteContract}
          />
        ))}
      </div>

      <ContractModal open={isOpen} cancelFn={() => setOpen(false)} />
    </div>
  );
}
