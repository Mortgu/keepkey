import {useGetCloudDirectory} from "@/hooks/nextcloud-hook.ts";
import TemplateList from "@/routes/_main/settings/-components/template-list.tsx";

export default function SettingsPage() {
    const {data: templates, isPending, error} = useGetCloudDirectory("/Templates");

    if (isPending) {
        return (
            <p></p>
        )
    }

    return (
        <div className='grid gap-4'>
            <TemplateList templates={templates}/>
        </div>
    )
}
