import { useForm } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import type {
  Contract, ContractTranslationInput, Language
} from "@/types";
import { Button, DEFAULT_LANGUAGE_OPTIONS, FieldInput, FieldTextarea, FormModal, Input, SegmentedLanguageToggle } from "@/components";
import { useContractManager } from "@/hooks/contracts/contract-mutations";

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
  DE: langFields,
  EN: langFields,
});

function seedLang(translations: Contract["translations"] | undefined, lang: Language) {
  const t = translations?.find((x) => x.language === lang);
  return { name: t?.name ?? "", features: t?.features ?? [], table: t?.table ?? "" };
}

export default function ContractModal({ onClose, currentContract = null }: ContractModalProps) {
  const isEdit = currentContract !== null;

  const {
    createContract,
    updateContract
  } = useContractManager();

  const [language, setLanguage] = useState<Language>("DE");

  const contractForm = useForm({
    defaultValues: {
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
          input: { translations },
        });
      } else {
        createContract({
          input: { translations }
        });
      }
      onClose();
    },
  });

  return (
    <FormModal
      form={contractForm}
      onClose={onClose}
      formId="contract-form"
      size="xs"
      title={
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
      }
    >
      <contractForm.Field name={`${language}.name`} children={(field) => (
        <div className="grid gap-2">
          <FieldInput field={field} label={`Name (${language})`} />
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
                    aria-label="Feature entfernen"
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
        <FieldTextarea field={field} rows={5} label={`Tabelle (${language})`} placeholder="Datenvolumen" />
      )} />
    </FormModal>
  );
}
