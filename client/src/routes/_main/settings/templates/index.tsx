import {createFileRoute} from "@tanstack/react-router";

import TemplateList from "@/routes/_main/settings/-components/template-list.tsx";

export const Route = createFileRoute("/_main/settings/templates/")({
    component: () => <TemplateList />,
});