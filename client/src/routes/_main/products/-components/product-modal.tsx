import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import type { CreateProductInput, UpdateProductInput } from "@/types";
import { Input, Button, ModalDialog } from "@/components";

interface ProductModalProps {
  open: boolean;
  cancelFn: () => void;
  submitFn: (value: CreateProductInput) => void;
  currentItem?: UpdateProductInput | null;
}

const productScheme = z.object({
  name: z.string().min(1, "Mindestens 1 Zeichen"),
  description: z.string(),
  table: z.string(),
});

const emptyData: CreateProductInput = {
  name: "",
  description: "",
  table: "",
};

export default function ProductModal({
  open,
  cancelFn,
  submitFn,
  currentItem = null,
}: ProductModalProps) {
  const isEdit = currentItem !== null;

  const productForm = useForm({
    defaultValues: currentItem || emptyData,
    validators: {
      onChange: productScheme,
      onMount: productScheme,
    },
    onSubmit: ({ value }) => {
      submitFn(value as CreateProductInput);
      cancelFn();
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    productForm.handleSubmit();
  };

  return (
    <ModalDialog open={open} cancelFn={cancelFn}>
      <ModalDialog.Header>
        <h1 className="text-lg">
          {isEdit && "Produkt bearbeiten"}
          {!isEdit && "Neues Produkt anlegen"}
        </h1>
      </ModalDialog.Header>

      <ModalDialog.Content>
        <form id="product-form" onSubmit={handleSubmit} className="grid gap-4">
          <productForm.Field
            name="name"
            children={(field) => (
              <div className="grid gap-1">
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  label="Produkt Name"
                  error={field.state.meta.errors
                    .map((e) => e?.message)
                    .join(" & ")}
                  placeholder="Produkt Name"
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />

          <productForm.Field
            name="description"
            children={(field) => (
              <div className="grid gap-1">
                <label htmlFor={field.name} className="text-sm text-gray-500">
                  Produkt Beschreibung
                </label>
                <textarea
                  rows={5}
                  id={field.name}
                  name={field.name}
                  className="flex-1 outline-none border border-(--border) p-2 rounded-md"
                  value={field.state.value}
                  placeholder="Produkt Beschreibung"
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />

          <productForm.Field
            name="table"
            children={(field) => (
              <div className="grid gap-1">
                <label htmlFor={field.name} className="text-sm text-gray-500">
                  Tabelle Beschreibung
                </label>
                <textarea
                  rows={5}
                  id={field.name}
                  name={field.name}
                  className="flex-1 outline-none border border-(--border) p-2 rounded-md"
                  value={field.state.value}
                  placeholder="Tabellen Beschreibung"
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
        </form>
      </ModalDialog.Content>

      <ModalDialog.Footer>
        <Button onClick={cancelFn} type="button" size="sm" variant="secondary">
          Abbrechen
        </Button>
        <productForm.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              form="product-form"
              disabled={!canSubmit}
              type="submit"
              size="sm"
              loading={isSubmitting}
            >
              Speichern
            </Button>
          )}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
