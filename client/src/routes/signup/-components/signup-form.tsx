import {useState} from "react";
import {useForm } from "@tanstack/react-form";
import {authClient} from "@/lib/auth-client.ts";
import {Loader} from "lucide-react";

import { z } from 'zod';
import Input from "@/components/inputs/input.tsx";
import Button from "@/components/button/button.tsx";

export function SignupFormComponent() {
    const [error, setError] = useState<string | undefined>(undefined);

    const form = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            image: '',
        },

        validators: {
          onChange: z.object({
              name: z.string().min(1),
              email: z.email(),
              password: z.string().min(8),
              image: z.string(),
          })
        },

        onSubmit: async ({value}) => {
            const {data, error} = await authClient.signUp.email({
                ...value
            });

            if (error) {
                setError(error.message);
                return null;
            }

            return data;
        }
    });

    return (
        <div className='w-full'>
            <form onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }} className='grid gap-6'>
                {error && (
                    <div>{error}</div>
                )}
                <div className='grid gap-6'>
                    <form.Field name="name" children={(field) => (
                        <div className='grid gap-2'>
                            <label>Name</label>
                            <Input id={field.name} name={field.name} value={field.state.value}
                                   onChange={(e) => field.handleChange(e.target.value)} type="text"/>
                        </div>
                    )}/>
                    <form.Field name="email" children={(field) => (
                        <div className='grid gap-2'>
                            <label>E-Mail Adresse</label>
                            <Input id={field.name} name={field.name} value={field.state.value}
                                   onChange={(e) => field.handleChange(e.target.value)} type="email"/>
                        </div>
                    )}/>
                    <form.Field name="password" children={(field) => (
                        <div className='grid gap-2'>
                            <label>Passwort</label>
                            <Input id={field.name} name={field.name} value={field.state.value}
                                   onChange={(e) => field.handleChange(e.target.value)} type="password"/>
                        </div>
                    )}/>
                    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}
                                    children={([canSubmit, isSubmitting]) => (
                                        <>
                                            <Button type="submit" disabled={!canSubmit}>
                                                {isSubmitting ? <Loader className='animate-spin'/> : 'Registrieren'}
                                            </Button>
                                        </>
                                    )}/>
                </div>
            </form>
            <p>
                <a href="/signup">SignUp</a>
            </p>
        </div>
    )
}