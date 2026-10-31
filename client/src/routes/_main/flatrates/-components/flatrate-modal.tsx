import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { createFlatrateSchema, flatrateTranslationSchema } from '@keepit/schemas';
import { z } from "zod";
import type { CreateFlatrateTranslationInput, Flatrate, Language } from '@keepit/schemas';
import type { TranslationKey } from "@/i18n";

import {
	Button,
	Dialog,
	FieldInput,
	FieldTextarea,
	NumberField,
	SegmentedLanguageToggle
} from "@/components";
import { DEFAULT_LANGUAGE_OPTIONS } from "@/components/elements/language-toggle-options";
import { useCreateFlatRate, useUpdateFlatRate } from "@/hooks";
import { centsToEur, eurToCents } from "@/utils/utils";

interface Props {
	currentFlatrate?: Flatrate | null;
	onClose: () => void;
}

/* Das geteilte Schema meldet leere Felder mit einem festen englischen Text
   ("Required!"), den auch der Server nutzt. Im Formular gilt dieselbe Regel,
   nur mit Übersetzungsschlüssel — aufgelöst wird er bei der Anzeige. */
const required = z.string().nonempty("validation.required" satisfies TranslationKey);
const flatrateFormSchema = createFlatrateSchema.extend({
	translations: z.array(flatrateTranslationSchema.extend({ name: required, table: required })).min(1),
});

function seedLang(translations: Array<CreateFlatrateTranslationInput> | undefined, lang: Language) {
	const t = translations?.find((x) => x.language === lang);
	return { name: t?.name ?? "", table: t?.table ?? "", language: lang };
}

export default function FlatRateModal({ currentFlatrate, onClose }: Props) {
	const { t } = useTranslation();
	const isEdit = currentFlatrate != null;

	const [language, setLanguage] = useState<Language>("DE");
	const langIndex = language === "DE" ? 0 : 1;

	const { createFlatRate } = useCreateFlatRate();
	const { updateFlatRate } = useUpdateFlatRate();

	const form = useForm({
		defaultValues: {
			totalCents: currentFlatrate?.totalCents ?? 0,
			translations: [
				seedLang(currentFlatrate?.translations, "DE"),
				seedLang(currentFlatrate?.translations, "EN"),
			]
		},
		validators: {
			onChange: flatrateFormSchema,
			onMount: flatrateFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (isEdit) {
				await updateFlatRate({ id: currentFlatrate.id, flatRate: value });
			} else {
				await createFlatRate(value);
			}

			onClose();
		},
	});

	const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {

		e.preventDefault();

		e.stopPropagation();

		form.handleSubmit();

	};


	return (
		<Dialog
			defaultOpen
			onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
		>
			<Dialog.Header title={isEdit ? t("flatrates.modal.editTitle") : t("flatrates.modal.createTitle")}>
				<SegmentedLanguageToggle
					options={DEFAULT_LANGUAGE_OPTIONS}
					value={language}
					onChange={(lng) => setLanguage(lng)}
				/>
			</Dialog.Header>
			<Dialog.Body>
				<form id="flatrate-form" onSubmit={handleSubmit} className="grid gap-4">
					<form.Field name={`translations[${langIndex}].name`}>
						{(field) => (
							<div className="grid gap-1">
								<FieldInput field={field} label={t("flatrates.modal.name", { language })} placeholder={t("flatrates.modal.namePlaceholder")} />
							</div>
						)}
					</form.Field>

					<form.Field name={`translations[${langIndex}].table`}>
						{(field) => (
							<FieldTextarea field={field} rows={4} label={t("flatrates.modal.table", { language })} placeholder={t("flatrates.modal.tablePlaceholder")} />
						)}
					</form.Field>

					{/* Gespeichert wird in Cent, eingegeben in Euro — die Umrechnung
					    läuft über die zentralen Helfer, nicht über eigene /100. */}
					<form.Field name="totalCents">
						{(field) => (
							<NumberField
								min={0.01}
								step={0.01}
								format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
								label={t("flatrates.modal.price")}
								suffix="€"
								value={centsToEur(field.state.value)}
								onValueChange={(value) => field.handleChange(value === null ? 0 : eurToCents(value))}
							/>
						)}
					</form.Field>
				</form>
			</Dialog.Body>
			<Dialog.Footer>
				<Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
					children={([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							form="flatrate-form"
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
