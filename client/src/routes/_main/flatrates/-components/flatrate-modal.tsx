import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import type { CreateFlatRateInput, FlatRateTranslationInput, Language, UpdateFlatRateInput } from "@/types";
import { getFormErrors } from "@/lib/utils";

import { Button, DEFAULT_LANGUAGE_OPTIONS, Input, ModalDialog, SegmentedLanguageToggle } from "@/components";

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

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  return (
    <ModalDialog onClose={onClose}>
      <ModalDialog.Header>
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
      </ModalDialog.Header>

      <ModalDialog.Content>
        <form id="flatrate-form" onSubmit={handleSubmit} className="grid gap-4">
          <form.Field name={`${language}.name`}>
            {(field) => (
              <div className="grid gap-1">
                <Input id={field.name} name={field.name} value={field.state.value}
                  label={`Name (${language})`}
                  error={getFormErrors(field.state.meta.errors)}
                  placeholder="Flatrate Name"
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name={`${language}.table`}>
            {(field) => (
              <div className="grid gap-1">
                <label htmlFor={field.name} className="text-sm text-gray-500">
                  Tabelle ({language})
                </label>
                <textarea rows={4} id={field.name} name={field.name}
                  value={field.state.value} placeholder="Tabellenbeschreibung"
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="flex-1 outline-none border border-(--border) p-2 rounded-md"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="total_cents">
            {(field) => (
              <div className="grid gap-1">
                <label htmlFor={field.name} className="text-sm text-gray-500">
                  Preis (in Cent)
                </label>
                <input id={field.name} name={field.name} type="number" min={0}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(parseInt(e.target.value))}
                  className="flex-1 outline-none border border-(--border) p-2 rounded-md"
                />
              </div>
            )}
          </form.Field>
        </form>
      </ModalDialog.Content>

      <ModalDialog.Footer>
        <Button onClick={onClose} type="button" size="sm" variant="secondary">
          Abbrechen
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button form="flatrate-form" disabled={!canSubmit} type="submit" size="sm" loading={isSubmitting}>
              Speichern
            </Button>
          )}
        </form.Subscribe>
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
