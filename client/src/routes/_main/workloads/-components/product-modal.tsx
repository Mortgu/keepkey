import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import type {
  CreateProductInput,
  Language,
  ProductTranslationInput,
  UpdateProductInput,
} from "@/types";
import {
  Button,
  DEFAULT_LANGUAGE_OPTIONS,
  Input,
  ModalDialog,
  SegmentedLanguageToggle,
} from "@/components";
import { getFormError } from "@/lib/utils";

interface ProductModalProps {
  onClose: () => void;
  submitFn: (value: CreateProductInput) => void;
  currentItem?: UpdateProductInput | null;
}

const langFields = z.object({
  name: z.string().min(1, "Mindestens 1 Zeichen"),
  description: z.string(),
  table: z.string(),
});

const productScheme = z.object({
  DE: langFields,
  EN: langFields,
});

function seedLang(
  translations: UpdateProductInput["translations"],
  lang: Language,
) {
  const t = translations?.find((x) => x.language === lang);
  return {
    name: t?.name ?? "",
    description: t?.description ?? "",
    table: t?.table ?? "",
  };
}

export default function ProductModal({
  onClose,
  submitFn,
  currentItem = null,
}: ProductModalProps) {
  const isEdit = currentItem != null;

  const [language, setLanguage] = useState<Language>("DE");

  const productForm = useForm({
    defaultValues: {
      DE: seedLang(currentItem?.translations, "DE"),
      EN: seedLang(currentItem?.translations, "EN"),
    },
    validators: {
      onChange: productScheme,
      onMount: productScheme,
    },
    onSubmit: ({ value }) => {
      const translations: Array<ProductTranslationInput> = [
        { language: "DE", ...value.DE },
        { language: "EN", ...value.EN },
      ];
      submitFn({ translations });
      onClose();
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    productForm.handleSubmit();
  };

  return (
    <ModalDialog onClose={onClose}>
      <ModalDialog.Header>
        <div className="flex items-center justify-between w-full mr-2">
          <h1 className="text-lg">
            {isEdit ? "Produkt bearbeiten" : "Produkt erstellen"}
          </h1>

          <SegmentedLanguageToggle
            options={DEFAULT_LANGUAGE_OPTIONS}
            value={language}
            onChange={(lng) => setLanguage(lng)}
          />
        </div>
      </ModalDialog.Header>

      <ModalDialog.Content>
        <form id="product-form" onSubmit={handleSubmit} className="grid gap-4">
          <productForm.Field name={`${language}.name`} children={(field) => (
            <div className="grid gap-1">
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                label={`Produkt Name (${language})`}
                error={getFormError(field.state.meta.errors)}
                placeholder="Produkt Name"
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )} />

          <productForm.Field
            name={`${language}.description`}
            children={(field) => (
              <div className="grid gap-1">
                <label htmlFor={field.name} className="text-sm text-gray-500">
                  Produkt Beschreibung ({language})
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
            name={`${language}.table`}
            children={(field) => (
              <div className="grid gap-1">
                <label htmlFor={field.name} className="text-sm text-gray-500">
                  Tabelle Beschreibung ({language})
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
        <Button onClick={onClose} type="button" size="sm" variant="secondary">
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
