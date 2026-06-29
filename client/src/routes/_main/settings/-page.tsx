import { useGetCloudDirectory } from "@/hooks/nextcloud-hook.ts";
import { PageWidth } from "@/components";
import TemplateList from "@/routes/_main/settings/-components/template-list.tsx";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function SettingsPage() {
    const { data: templates, isPending, error } = useGetCloudDirectory("/Templates");

    if (isPending) {
        return (
            <p></p>
        )
    }

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);

    return (
        <PageWidth>
            <div className='grid gap-4'>
                <TemplateList templates={templates ?? []} />
            </div>
        </PageWidth>
    )
}
