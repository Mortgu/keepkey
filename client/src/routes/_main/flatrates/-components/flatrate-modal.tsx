import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { createFlatrateSchema } from '@keepit/schemas';
import type { CreateFlatrateTranslationInput, Flatrate, Language } from '@keepit/schemas';

import {
	DEFAULT_LANGUAGE_OPTIONS,
	FieldInput,
	FieldTextarea,
	FormDialog,
	NumberField,
	SegmentedLanguageToggle
} from "@/components";
import { useCreateFlatRate, useUpdateFlatRate } from "@/hooks";

interface Props {
	currentFlatrate?: Flatrate | null;
	onClose: () => void;
}

function seedLang(translations: Array<CreateFlatrateTranslationInput> | undefined, lang: Language) {
	const t = translations?.find((x) => x.language === lang);
	return { name: t?.name ?? "", table: t?.table ?? "", language: lang };
}

export default function FlatRateModal({ currentFlatrate, onClose }: Props) {
	const isEdit = currentFlatrate != null;

	const [language, setLanguage] = useState<Language>("DE");
	const langIndex = language === "DE" ? 0 : 1;

	const { createFlatRate } = useCreateFlatRate();
	const { updateFlatRate } = useUpdateFlatRate();

	const form = useForm({
		defaultValues: {
			total_cents: currentFlatrate?.total_cents ?? 0,
			translations: [
				seedLang(currentFlatrate?.translations, "DE"),
				seedLang(currentFlatrate?.translations, "EN"),
			]
		},
		validators: {
			onChange: createFlatrateSchema,
			onMount: createFlatrateSchema,
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

	return (
		<FormDialog
			form={form}
			defaultOpen
			onClose={onClose}
			formId="flatrate-form"
			title={isEdit ? "Flatrate bearbeiten" : "Neue Flatrate anlegen"}
			headerActions={
				<SegmentedLanguageToggle
					options={DEFAULT_LANGUAGE_OPTIONS}
					value={language}
					onChange={(lng) => setLanguage(lng)}
				/>
			}
		>
			<form.Field name={`translations[${langIndex}].name`}>
				{(field) => (
					<div className="grid gap-1">
						<FieldInput field={field} label={`Name (${language})`} placeholder="Flatrate Name" />
					</div>
				)}
			</form.Field>

			<form.Field name={`translations[${langIndex}].table`}>
				{(field) => (
					<FieldTextarea field={field} rows={4} label={`Tabelle (${language})`} placeholder="Tabellenbeschreibung" />
				)}
			</form.Field>

			<form.Field name="total_cents">
				{(field) => (
					<NumberField
						min={1}
						label="Preis (€)"
						value={field.state.value}
						onValueChange={(value) => field.handleChange(value ?? 0)}
						step={1}
					/>
				)}
			</form.Field>
		</FormDialog>
	);
}
