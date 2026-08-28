import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { createFlatrateSchema } from '@keepit/schemas';
import type { CreateFlatrateTranslationInput, Flatrate, Language } from '@keepit/schemas';

import {
    Button,
    DEFAULT_LANGUAGE_OPTIONS,
    Dialog,
    FieldInput,
    FieldTextarea,
    NumberField,
    SegmentedLanguageToggle,
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
	const { t } = useTranslation();
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
			<Dialog.Header title={isEdit ? "Flatrate bearbeiten" : "Neue Flatrate anlegen"}>
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
