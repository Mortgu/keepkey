import Button from "@/components/button/button";
import ModalDialog from "@/components/modal";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

type Fields = {
    name: string;
    description: string;
    link: string;
}

interface ProductModalProps {
    open: boolean;
    cancelFn: () => void;
    submitFn: (value: Fields) => void;
    currentItem?: Fields | null;
};

const productScheme = z.object({
    name: z.string().min(1, "Mindestens 1 Zeichen"),
    description: z.string(),
    link: z.url("Not a valid url!"),
});

const emptyData: Fields = {
    name: "",
    description: "",
    link: "",
};

export default function ProductModal({ open, cancelFn, submitFn, currentItem = null }: ProductModalProps) {
    const isEdit = currentItem !== null;

    const productForm = useForm({
        defaultValues: currentItem || emptyData,
        validators: {
            onChange: productScheme,
        },
        onSubmit: ({ value }) => {
            submitFn(value);
            cancelFn();
        },
    });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        productForm.handleSubmit();
    }

    return (
        <ModalDialog open={open} cancelFn={cancelFn}>
            <ModalDialog.Header>
                <h1 className="text-lg">
                    {isEdit && 'Produkt bearbeiten'}
                    {!isEdit && 'Neues Produkt anlegen'}
                </h1>
            </ModalDialog.Header>

            <ModalDialog.Content>
                <form id="product-form" onSubmit={handleSubmit} className="grid gap-4">
                    <productForm.Field name="name" children={(field) => (
                        <div className="grid gap-1">
                            <div className="flex items-center justify-between">
                                <label htmlFor={field.name} className="text-sm  text-gray-500">Produkt Name</label>
                                {field.state.meta.errors.map((error, i) => (
                                    <p key={i} className="text-sm text-red-500">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                            <input id={field.name} name={field.name} className='flex-1 outline-none border border-(--border) p-2 rounded-md'
                                value={field.state.value} placeholder="Produkt Name" onChange={(e) => field.handleChange(e.target.value)} />
                        </div>
                    )} />

                    <productForm.Field name="link" children={(field) => (
                        <div className="grid gap-1">
                            <div className="flex items-center justify-between">
                                <label htmlFor={field.name} className="text-sm  text-gray-500">KeepIt Link</label>
                                {field.state.meta.errors.map((error, i) => (
                                    <p key={i} className="text-sm text-red-500">
                                        {error?.message}
                                    </p>
                                ))}
                            </div>
                            <input id={field.name} name={field.name} className='flex-1 outline-none border border-(--border) p-2 rounded-md'
                                value={field.state.value} placeholder="https://www.keepit.com/" onChange={(e) => field.handleChange(e.target.value)} />
                        </div>
                    )} />

                    <productForm.Field name="description" children={(field) => (
                        <div className="grid gap-1">
                            <label htmlFor={field.name} className="text-sm text-gray-500">Produkt Beschreibung</label>
                            <textarea rows={10} id={field.name} name={field.name} className='flex-1 outline-none border border-(--border) p-2 rounded-md'
                                value={field.state.value} placeholder="Produkt Name" onChange={(e) => field.handleChange(e.target.value)} />
                        </div>
                    )} />
                </form>
            </ModalDialog.Content>

            <ModalDialog.Footer>
                <Button onClick={cancelFn} type='button' size='sm' variant='secondary'>Abbrechen</Button>
                <productForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                    <Button form="product-form" disabled={!canSubmit} type='submit' size='sm' loading={isSubmitting}>
                        Speichern
                    </Button>
                )} />
            </ModalDialog.Footer>
        </ModalDialog>
    );
}