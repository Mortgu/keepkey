import { createFileRoute } from '@tanstack/react-router'
import {LoginComponent} from "@/routes/login/-components/login-form.tsx";

export const Route = createFileRoute('/login/')({
    component: LoginComponent,
});
