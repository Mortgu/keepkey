import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import type { CreateProductInput, Language, UpdateProductInput } from "@/types";
import { Button, DEFAULT_LANGUAGE_OPTIONS, Input, ModalDialog, SegmentedLanguageToggle, SingleDropdown } from "@/components";
import { useState } from "react";

interface ProductModalProps {
    onClose: () => void;
    submitFn: (value: CreateProductInput) => void;
    currentItem?: UpdateProductInput | null;
}

const productScheme = z.object({
    name: z.string().min(1, "Mindestens 1 Zeichen"),
    description: z.string(),
    table: z.string(),
});

const emptyData: CreateProductInput = {
    name: "",
    description: "",
    table: "",
};

export default function ProductModal({ onClose, submitFn, currentItem = null }: ProductModalProps) {
    const isEdit = currentItem !== null;

    const [language, setLanguage] = useState<Language>("DE");

    const productForm = useForm({
        defaultValues: currentItem || emptyData,
        validators: {
            onChange: productScheme,
            onMount: productScheme,
        },
        onSubmit: ({ value }) => {
            submitFn(value as CreateProductInput);
            onClose();
        },
    });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        productForm.handleSubmit();
    };

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <div className="flex items-center justify-between w-full mr-2">
                    <h1 className="text-lg">{isEdit ? "Produkt bearbeiten" : "Produkt erstellen"}</h1>

                    <SegmentedLanguageToggle
                        options={DEFAULT_LANGUAGE_OPTIONS}
                        value={language}
                        onChange={(lng) => setLanguage(lng)}
                    />
                </div>
            </ModalDialog.Header>

            <ModalDialog.Content>
                <form id="product-form" onSubmit={handleSubmit} className="grid gap-4">
                    <productForm.Field name="name" children={(field) => (
                        <div className="grid gap-1">
                            <Input id={field.name} name={field.name} value={field.state.value}
                                label="Produkt Name"
                                error={field.state.meta.errors.map((e) => e?.message).join(" & ")}
                                placeholder="Produkt Name"
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        </div>
                    )} />

                    <productForm.Field name="description" children={(field) => (
                        <div className="grid gap-1">
                            <label htmlFor={field.name} className="text-sm text-gray-500">
                                Produkt Beschreibung
                            </label>
                            <textarea rows={5} id={field.name} name={field.name}
                                className="flex-1 outline-none border border-(--border) p-2 rounded-md"
                                value={field.state.value} placeholder="Produkt Beschreibung"
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        </div>
                    )} />

                    <productForm.Field name="table" children={(field) => (
                        <div className="grid gap-1">
                            <label htmlFor={field.name} className="text-sm text-gray-500">
                                Tabelle Beschreibung
                            </label>
                            <textarea rows={5} id={field.name} name={field.name}
                                className="flex-1 outline-none border border-(--border) p-2 rounded-md"
                                value={field.state.value} placeholder="Tabellen Beschreibung"
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        </div>
                    )} />
                </form>
            </ModalDialog.Content>

            <ModalDialog.Footer>
                <Button onClick={onClose} type="button" size="sm" variant="secondary">
                    Abbrechen
                </Button>
                <productForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button form="product-form" disabled={!canSubmit} type="submit" size="sm"
                            loading={isSubmitting}>
                            Speichern
                        </Button>
                    )}
                />
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
