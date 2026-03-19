import {createFileRoute} from '@tanstack/react-router'
import {LoginFormComponent} from "@/routes/login/-components/login-form.tsx";
import {z} from "zod";

const loginSearchSchema = z.object({
    redirect: z.string().default('/'),
});

export const Route = createFileRoute('/login/')({
    validateSearch: loginSearchSchema,
    component: LoginFormComponent,
});
