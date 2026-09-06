import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import type {
  CreateProductInput,
  Language,

  ProductTranslationInput,
  UpdateProductInput
} from '@keepit/schemas';
import {
    Button,
    DEFAULT_LANGUAGE_OPTIONS,
    Dialog,
    FieldInput,
    FieldTextarea,
    SegmentedLanguageToggle,
} from "@/components";


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

function seedLang(translations: Array<ProductTranslationInput> | undefined, lang: Language) {
  const t = translations?.find((x: ProductTranslationInput) => x.language === lang);
  return {
    name: t?.name ?? "",
    description: t?.description ?? "",
    table: t?.table ?? "",
  };
}

export default function ProductModal({ onClose, submitFn, currentItem = null }: ProductModalProps) {
  const { t } = useTranslation();
  const isEdit = currentItem != null;

  const [language, setLanguage] = useState<Language>("DE");

  const productForm = useForm({
    defaultValues: {
      DE: seedLang(currentItem?.translations ?? [], "DE"),
      EN: seedLang(currentItem?.translations ?? [], "EN"),
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
    <Dialog
      defaultOpen
      onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
    >
      <Dialog.Header title={isEdit ? "Produkt bearbeiten" : "Produkt erstellen"}>
        <SegmentedLanguageToggle
          options={DEFAULT_LANGUAGE_OPTIONS}
          value={language}
          onChange={(lng) => setLanguage(lng)}
        />
      </Dialog.Header>
      <Dialog.Body>
        <form id="product-form" onSubmit={handleSubmit} className="grid gap-4">
          <productForm.Field name={`${language}.name`} children={(field) => (
            <div className="grid gap-1">
              <FieldInput field={field} label={`Produkt Name (${language})`} placeholder="Produkt Name" />
            </div>
          )} />

          <productForm.Field name={`${language}.description`} children={(field) => (
            <FieldTextarea field={field} rows={5} label={`Produkt Beschreibung (${language})`} placeholder="Produkt Beschreibung" />
          )} />

          <productForm.Field name={`${language}.table`} children={(field) => (
            <FieldTextarea field={field} rows={5} label={`Tabelle Beschreibung (${language})`} placeholder="Tabellen Beschreibung" />
          )} />
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
        <productForm.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              form="product-form"
              size="sm"
              disabled={!canSubmit}
              loading={isSubmitting}
            >
              {t("button.save")}
            </Button>
          )}
        />
      </Dialog.Footer>
    </Dialog>
  );
}
