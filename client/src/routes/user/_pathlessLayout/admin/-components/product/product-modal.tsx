import Button from "@/components/button/button";
import { useForm } from "@tanstack/react-form";
import { Loader } from "lucide-react";
import { z } from "zod";

type Fields = {
    name: string;
    description: string;
    link: string;
}

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: Fields) => void;
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

export default function ProductModal({ isOpen, onClose, onSubmit, currentItem }: ProductModalProps) {
    if (!isOpen) return null;

    const productForm = useForm({
        defaultValues: currentItem || emptyData,
        validators: {
            onChange: productScheme,
        },
        onSubmit: ({ value }) => {
            onSubmit(value);
            onClose();
        },
    });

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="p-4 relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Body/Form */}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    productForm.handleSubmit(productForm);
                }} className="grid gap-4">
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
                            <input id={field.name} name={field.name} className='flex-1 outline-none border border-gray-300 p-2 rounded-md'
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
                            <input id={field.name} name={field.name} className='flex-1 outline-none border border-gray-300 p-2 rounded-md'
                                value={field.state.value} placeholder="https://www.keepit.com/" onChange={(e) => field.handleChange(e.target.value)} />
                        </div>
                    )} />

                    <productForm.Field name="description" children={(field) => (
                        <div className="grid gap-1">
                            <label htmlFor={field.name} className="text-sm text-gray-500">Produkt Beschreibung</label>
                            <textarea id={field.name} name={field.name} className='flex-1 outline-none border border-gray-300 p-2 rounded-md'
                                value={field.state.value} placeholder="Produkt Name" onChange={(e) => field.handleChange(e.target.value)} />
                        </div>
                    )} />

                    <div className='flex items-center gap-2 w-full'>
                        <Button onClick={onClose} className="flex-1" type='button' size='sm' variant='secondary'>Cancel</Button>
                        <productForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                            <Button className="flex-1" disabled={!canSubmit} type='submit' size='sm'>
                                {isSubmitting && <Loader className='animate-spin' />}
                                {!isSubmitting && ("Save")}
                            </Button>
                        )} />
                    </div>
                </form>

            </div>
        </div>
    );
}