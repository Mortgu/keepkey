import { createFileRoute } from '@tanstack/react-router'
import { z } from "zod";
import { LoginFormComponent } from './-components/login-form';

const loginSearchSchema = z.object({
    redirect: z.string().default('/'),
});

export const Route = createFileRoute('/_main/login/')({
    validateSearch: loginSearchSchema,
    component: LoginFormComponent,
});
