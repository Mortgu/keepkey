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
  DEFAULT_LANGUAGE_OPTIONS,
  FieldInput,
  FieldTextarea,
  FormModal,
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

  return (
    <FormModal
      form={productForm}
      onClose={onClose}
      formId="product-form"
      title={
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
      }
    >
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
    </FormModal>
  );
}
