import { useForm } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import type {
  Contract,
  ContractTranslationInput,
  CreateContractInput,
  Language,
  UpdateContractInput,
} from "@/types";
import { useContractHook } from "@/hooks";
import { Button, DEFAULT_LANGUAGE_OPTIONS, Input, ModalDialog, SegmentedLanguageToggle } from "@/components";
import { getFormErrors } from "@/lib/utils";

interface ContractModalProps {
  onClose: () => void;
  currentContract?: Contract | null;
}

const langFields = z.object({
  name: z.string().min(1, "Mindestens 1 Zeichen!"),
  features: z.array(z.string()),
  table: z.string(),
});

const contractSchema = z.object({
  key: z.string().min(1, "Schlüssel erforderlich"),
  DE: langFields,
  EN: langFields,
});

function seedLang(translations: Contract["translations"] | undefined, lang: Language) {
  const t = translations?.find((x) => x.language === lang);
  return { name: t?.name ?? "", features: t?.features ?? [], table: t?.table ?? "" };
}

export default function ContractModal({ onClose, currentContract = null }: ContractModalProps) {
  const isEdit = currentContract !== null;

  const { updateContract, createContract } = useContractHook();

  const [language, setLanguage] = useState<Language>("DE");

  const contractForm = useForm({
    defaultValues: {
      key: currentContract?.key ?? "",
      DE: seedLang(currentContract?.translations, "DE"),
      EN: seedLang(currentContract?.translations, "EN"),
    },
    validators: {
      onChange: contractSchema,
    },
    onSubmit: ({ value }) => {
      const translations: Array<ContractTranslationInput> = [
        { language: "DE", ...value.DE },
        { language: "EN", ...value.EN },
      ];
      if (isEdit) {
        updateContract({
          id: currentContract.id,
          data: { key: value.key, translations },
        });
      } else {
        createContract({ key: value.key, translations });
      }
      onClose();
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    contractForm.handleSubmit();
  };

  return (
    <ModalDialog onClose={onClose}>
      <ModalDialog.Header>
        <div className="flex items-center justify-between w-full mr-2">
          <h1 className="text-lg">
            {isEdit ? "Vertrag bearbeiten" : "Neuen Vertrag anlegen"}
          </h1>
          <SegmentedLanguageToggle
            options={DEFAULT_LANGUAGE_OPTIONS}
            value={language}
            onChange={(lng) => setLanguage(lng)}
          />
        </div>
      </ModalDialog.Header>
      <ModalDialog.Content>
        <form id="contract-form" onSubmit={handleSubmit} className="grid gap-4">
          <contractForm.Field name="key" children={(field) => (
            <div className="grid gap-2">
              <Input id={field.name} value={field.state.value} label="Schlüssel (sprachunabhängig)"
                disabled={isEdit}
                error={getFormErrors(field.state.meta.errors)}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )} />

          <contractForm.Field name={`${language}.name`} children={(field) => (
            <div className="grid gap-2">
              <Input id={field.name} value={field.state.value} label={`Name (${language})`}
                error={getFormErrors(field.state.meta.errors)}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )} />

          <contractForm.Field name={`${language}.features`} mode="array" children={(field) => (
            <div className="grid gap-2">
              <label className="text-sm text-gray-500">Features ({language}):</label>
              <div className="grid gap-2">
                {field.state.value.map((_, index) => (
                  <contractForm.Field key={index} name={`${language}.features[${index}]`} children={(itemField) => (
                    <div className="flex gap-2">
                      <Input value={itemField.state.value} onChange={(e) => itemField.handleChange(e.target.value)}
                        onBlur={itemField.handleBlur} placeholder={`Feature ${index + 1}`} />
                      <Button variant="secondary" size="sm" type="button"
                        icon={<Trash2 className="size-4" />} iconOnly
                        onClick={() => field.removeValue(index)} />
                    </div>
                  )} />
                ))}
              </div>
              <Button type="button" variant="secondary" size="sm"
                icon={<Plus className="size-4" />} onClick={() => field.pushValue("")}>
                Feature hinzufügen
              </Button>
            </div>
          )} />

          <contractForm.Field name={`${language}.table`} children={(field) => (
            <div className="grid gap-1">
              <label htmlFor={field.name} className="text-sm text-gray-500">
                Tabelle ({language})
              </label>
              <textarea id={field.name} name={field.name} rows={5}
                className="flex-1 outline-none border border-(--border) p-2 rounded-md"
                value={field.state.value} placeholder="Datenvolumen"
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )} />
        </form>
      </ModalDialog.Content>
      <ModalDialog.Footer>
        <Button onClick={onClose} type="button" size="xs" variant="secondary">
          Abbrechen
        </Button>
        <contractForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button form="contract-form" disabled={!canSubmit} type="submit" size="xs" loading={isSubmitting}>
              Speichern
            </Button>
          )}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
