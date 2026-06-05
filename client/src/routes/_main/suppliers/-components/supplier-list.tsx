import { Fragment } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components";
import type { Supplier } from "@/types";
import { useModal, useSupplierHook } from "@/hooks";
import SupplierListItem from "./supplier-list-item";
import SupplierModal from "./supplier-modal";

export default function SupplierList() {
  const modal = useModal();
  const {
    suppliers,
    isDeletingSupplier,
  } = useSupplierHook();

  return (
    <Fragment>
      <div className="grid gap-2">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
            Lieferanten
          </h1>
          <Button onClick={() => modal.open()} size="sm">
            Erstellen <Plus className="size-4" />
          </Button>
        </div>

        {suppliers.map((supplier: Supplier) => (
          <SupplierListItem key={supplier.id} supplier={supplier} />
        ))}
      </div>

      {modal.isOpen && (
        <SupplierModal key={modal.key} onClose={modal.close} />
      )}
    </Fragment>
  );
}
