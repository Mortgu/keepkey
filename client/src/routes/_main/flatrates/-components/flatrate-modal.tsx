import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import type { CreateFlatRateInput, FlatRateTranslationInput, Language, UpdateFlatRateInput } from "@/types";

import { DEFAULT_LANGUAGE_OPTIONS, FieldInput, FieldTextarea, FormModal, SegmentedLanguageToggle } from "@/components";

interface FlatRateModalProps {
  onClose: () => void;
  submitFn: (value: CreateFlatRateInput) => void;
  currentItem?: UpdateFlatRateInput | null;
}

const langFields = z.object({
  name: z.string().min(1, "Mindestens 1 Zeichen"),
  table: z.string().min(1, "Mindestens 1 Zeichen"),
});

const flatRateSchema = z.object({
  total_cents: z.number().int().nonnegative(),
  DE: langFields,
  EN: langFields,
});

function seedLang(translations: UpdateFlatRateInput["translations"], lang: Language) {
  const t = translations?.find((x) => x.language === lang);
  return { name: t?.name ?? "", table: t?.table ?? "" };
}

export default function FlatRateModal({ onClose, submitFn, currentItem = null }: FlatRateModalProps) {
  const isEdit = currentItem != null;

  const [language, setLanguage] = useState<Language>("DE");

  const form = useForm({
    defaultValues: {
      total_cents: currentItem?.total_cents ?? 0,
      DE: seedLang(currentItem?.translations, "DE"),
      EN: seedLang(currentItem?.translations, "EN"),
    },
    validators: {
      onChange: flatRateSchema,
      onMount: flatRateSchema,
    },
    onSubmit: ({ value }) => {
      const translations: Array<FlatRateTranslationInput> = [
        { language: "DE", ...value.DE },
        { language: "EN", ...value.EN },
      ];
      submitFn({ total_cents: value.total_cents, translations });
      onClose();
    },
  });

  return (
    <FormModal
      form={form}
      onClose={onClose}
      formId="flatrate-form"
      title={
        <div className="flex items-center justify-between w-full mr-2">
          <h1 className="text-lg">
            {isEdit ? "Flatrate bearbeiten" : "Neue Flatrate anlegen"}
          </h1>
          <SegmentedLanguageToggle
            options={DEFAULT_LANGUAGE_OPTIONS}
            value={language}
            onChange={(lng) => setLanguage(lng)}
          />
        </div>
      }
    >
      <form.Field name={`${language}.name`}>
        {(field) => (
          <div className="grid gap-1">
            <FieldInput field={field} label={`Name (${language})`} placeholder="Flatrate Name" />
          </div>
        )}
      </form.Field>

      <form.Field name={`${language}.table`}>
        {(field) => (
          <FieldTextarea field={field} rows={4} label={`Tabelle (${language})`} placeholder="Tabellenbeschreibung" />
        )}
      </form.Field>

      <form.Field name="total_cents">
        {(field) => (
          <FieldInput
            field={field}
            type="number"
            min={0}
            label="Preis (in Cent)"
            onChange={(e, f) => f.handleChange(parseInt(e.target.value))}
          />
        )}
      </form.Field>
    </FormModal>
  );
}
