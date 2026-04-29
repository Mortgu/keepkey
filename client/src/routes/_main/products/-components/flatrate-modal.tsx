import Button from "@/components/button/button";
import ModalDialog from "@/components/modal";
import type { BaseFlatRate } from "@/data/types";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

interface FlatRateModalProps {
    open: boolean;
    cancelFn: () => void;
    submitFn: (value: BaseFlatRate) => void;
    currentItem?: BaseFlatRate | null;
}

const flatRateSchema = z.object({
    name: z.string().min(1, "Mindestens 1 Zeichen"),
    table: z.string().min(1, "Mindestens 1 Zeichen"),
    total_cents: z.number().int().nonnegative(),
});

const emptyData: BaseFlatRate = {
    name: "",
    table: "",
    total_cents: 0,
};

export default function FlatRateModal({ open, cancelFn, submitFn, currentItem = null }: FlatRateModalProps) {
    const isEdit = currentItem !== null;

    const form = useForm({
        defaultValues: currentItem || emptyData,
        validators: {
            onChange: flatRateSchema,
            onMount: flatRateSchema,
        },
        onSubmit: ({ value }) => {
            submitFn(value);
            cancelFn();
        },
    });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
    };

    return (
        <ModalDialog open={open} cancelFn={cancelFn}>
            <ModalDialog.Header>
                <h1 className="text-lg">
                    {isEdit ? 'Flatrate bearbeiten' : 'Neue Flatrate anlegen'}
                </h1>
            </ModalDialog.Header>

            <ModalDialog.Content>
                <form id="flatrate-form" onSubmit={handleSubmit} className="grid gap-4">
                    <form.Field name="name">
                        {(field) => (
                            <div className="grid gap-1">
                                <div className="flex items-center justify-between">
                                    <label htmlFor={field.name} className="text-sm text-gray-500">Name</label>
                                    {field.state.meta.errors.map((error, i) => (
                                        <p key={i} className="text-sm text-red-500">
                                            {(error as unknown as { message?: string })?.message}
                                        </p>
                                    ))}
                                </div>
                                <input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    placeholder="Flatrate Name"
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="flex-1 outline-none border border-(--border) p-2 rounded-md"
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="table">
                        {(field) => (
                            <div className="grid gap-1">
                                <div className="flex items-center justify-between">
                                    <label htmlFor={field.name} className="text-sm text-gray-500">Tabelle</label>
                                    {field.state.meta.errors.map((error, i) => (
                                        <p key={i} className="text-sm text-red-500">
                                            {(error as unknown as { message?: string })?.message}
                                        </p>
                                    ))}
                                </div>

                                <textarea
                                    rows={4}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    placeholder="Tabellenbeschreibung"
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="flex-1 outline-none border border-(--border) p-2 rounded-md"
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="total_cents">
                        {(field) => (
                            <div className="grid gap-1">
                                <label htmlFor={field.name} className="text-sm text-gray-500">Preis (in Cent)</label>
                                <input
                                    id={field.name}
                                    name={field.name}
                                    type="number"
                                    min={0}
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
                <Button onClick={cancelFn} type="button" size="sm" variant="secondary">Abbrechen</Button>
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
