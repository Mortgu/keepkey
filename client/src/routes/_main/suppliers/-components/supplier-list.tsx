import { Fragment, useState } from "react";
import { z } from "zod";

import { Pen, Plus, Trash } from "lucide-react";
import { useForm } from "@tanstack/react-form";

import { Input, Button } from "@/components";
import type { Supplier } from "@/types";
import { useSupplierHook } from "@/hooks";
import SupplierListItem from "./supplier-list-item";
import SupplierModal from "./supplier-modal";

const supplierSchema = z.object({
  name: z.string().min(1, "Lieferant braucht mindestens ein Zeichen!"),
  supplierId: z.string(),
});

export default function SupplierList() {
  const [open, setOpen] = useState<boolean>(false);
  const {
    suppliers,
    createSupplier,
    deleteSupplier,
    isCreatingSupplier,
    isDeletingSupplier,
  } = useSupplierHook();

  const supplierForm = useForm({
    defaultValues: { name: "", supplierId: "" },
    validators: {
      onChange: supplierSchema,
    },
    onSubmit: async ({ value }) => {
      await createSupplier({ ...value });
      setOpen(false);

      return;
    },
  });

  const handleFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    supplierForm.handleSubmit();
  };

  return (
    <Fragment>
      <div className="grid gap-2">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
            Lieferanten
          </h1>
          <Button
            disabled={isCreatingSupplier || isDeletingSupplier}
            loading={isCreatingSupplier || isDeletingSupplier}
            onClick={() => setOpen(true)}
            size="sm"
          >
            Erstellen <Plus className="size-4" />
          </Button>
        </div>

        {suppliers.map((supplier: Supplier) => (
          <SupplierListItem key={supplier.id} supplier={supplier} />
        ))}


      </div>

      <SupplierModal open={open} cancelFn={() => setOpen(false)} />
    </Fragment>
  );
}
