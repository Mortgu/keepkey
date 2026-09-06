import { useCreateProduct } from "@/hooks";
import { type Language, type ProductTranslationInput, type UpdateProductInput } from "@keepit/schemas";
import { useForm } from "@tanstack/react-form";
import z from "zod";

interface Props {
    product?: UpdateProductInput | null;
}

const langFields = z.object({
    name: z.string().min(1, "Mindestens 1 Zeichen"),
    description: z.string(),
    table: z.string(),
});

const productSchema = z.object({
    DE: langFields,
    EN: langFields,
});

function seedLang(translations: Array<ProductTranslationInput> | undefined, lang: Language) {
    const t = translations?.find((x: ProductTranslationInput) => x.language === lang);
    return {
        name: t?.name ?? "",
        description: t?.description ?? "",
        table: t?.table ?? "",
    };
}

export default function useWorkloadForm({ product }: Props) {

    const { createProduct } = useCreateProduct();

    const form = useForm({
        defaultValues: {
            DE: seedLang(product?.translations ?? [], "DE"),
            EN: seedLang(product?.translations ?? [], "EN"),
        },
        validators: {
            onMount: productSchema,
            onChange: productSchema,
        },
        onSubmit: ({ value }) => {
            const translations: Array<ProductTranslationInput> = [
                { language: "DE", ...value.DE },
                { language: "EN", ...value.EN },
            ];

            createProduct({ translations });
        }
    });

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
    }

    return { form, handleSubmit };
}