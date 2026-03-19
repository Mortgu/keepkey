import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form';
import type { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import { Loader } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/login/')({
    component: RouteComponent,
})

function RouteComponent() {
    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        onSubmit: async ({ value }) => {
            const { data, error } = await authClient.signIn.email({
                ...value, rememberMe: true
            });

            if (error) {
                console.error(error);
            }

            return data;
        }
    });

    const handleSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
    }

    return (
        <div className='w-full'>
            <form onSubmit={handleSubmit} className='grid gap-6'>
                <div>
                    <form.Field name="email" children={(field) => (
                        <div className='grid gap-2'>
                            <label>E-Mail Adresse</label>
                            <input id={field.name} name={field.name} value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)} type="email" />
                        </div>
                    )} />
                    <form.Field name="password" children={(field) => (
                        <div className='grid gap-2'>
                            <label>Passwort</label>
                            <input id={field.name} name={field.name} value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)} type="password" />
                        </div>
                    )} />
                    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <>
                                <button type="submit" disabled={!canSubmit}>
                                    {isSubmitting ? <Loader className='animate-spin' /> : 'Anmelden'}
                                </button>
                            </>
                        )} />
                </div>
            </form>
        </div>
    )
}
