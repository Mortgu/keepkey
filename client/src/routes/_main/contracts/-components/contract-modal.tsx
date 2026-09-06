import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import type {
  Contract,
  ContractTranslationInput,
  Language
} from "@keepit/schemas";
import {
    Button,
    DEFAULT_LANGUAGE_OPTIONS,
    Dialog,
    FieldInput,
    FieldTextarea,
    Input,
    SegmentedLanguageToggle,
} from "@/components";
import {
  useContractManager
} from "@/hooks/contracts/contract-mutations";


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
  const { t } = useTranslation();
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

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {

      e.preventDefault();

      e.stopPropagation();

      contractForm.handleSubmit();

  };


  return (
    <Dialog
      defaultOpen
      onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
    >
      <Dialog.Header title={isEdit ? "Vertrag bearbeiten" : "Neuen Vertrag anlegen"}>
        <SegmentedLanguageToggle
          options={DEFAULT_LANGUAGE_OPTIONS}
          value={language}
          onChange={(lng) => setLanguage(lng)}
        />
      </Dialog.Header>
      <Dialog.Body>
        <form id="contract-form" onSubmit={handleSubmit} className="grid gap-4">
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
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.Close render={<Button variant="border" size="xs">{t("button.cancel")}</Button>} />
        <contractForm.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              form="contract-form"
              size="xs"
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
