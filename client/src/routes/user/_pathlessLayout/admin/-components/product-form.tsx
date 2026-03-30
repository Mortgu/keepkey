import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";

export type ProductFormData = {
    name: string;
    description: string;
    link: string;
};

type Props = {
    initialData?: ProductFormData | null;
    onSubmit: (data: ProductFormData) => void;
};

export default function ProductForm({ initialData, onSubmit }: Props) {
    const { handleSubmit, reset } = useForm({
        defaultValues: initialData || { name: '', description: '', link: '' }
    });

    useEffect(() => {
        reset(initialData || {
            name: '', description: '', link: ''
        });
    }, [initialData, reset]);

    return (
        <form onSubmit={() => handleSubmit(onSubmit)}>

        </form>
    );
}