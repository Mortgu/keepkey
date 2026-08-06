import { useUserManager } from "@/hooks";
import { createUserSchema, type CreateUserInput, type User } from "@keepit/schemas";
import { useForm } from "@tanstack/react-form";
import type { SyntheticEvent } from "react";

interface Props {
    currentEmployee?: User | null;
    onClose: () => void;
}

export default function useEmployeeForm({ currentEmployee, onClose }: Props) {
    const { updateUser, createUser } = useUserManager();

    const formId = "employee-form";

    const defaultValues: CreateUserInput = {
        firstName: currentEmployee?.firstName ?? '',
        lastName: currentEmployee?.lastName ?? '',
        salutation: currentEmployee?.salutation ?? '',
        email: currentEmployee?.email ?? '',
        phone: currentEmployee?.phone ?? '',
        password: '',
    }

    const form = useForm({
        defaultValues: defaultValues,
        validators: {
            onMount: createUserSchema,
            onChange: createUserSchema,
        },
        onSubmit: async ({ value }) => {
            if (currentEmployee) {
                await updateUser({
                    id: currentEmployee.id,
                    body: value
                });
            } else {
                await createUser(value);
            }
            onClose();
        }
    });

    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
    }

    return {
        form,
        formId,

        handleSubmit,
    }
}

export type EmployeeFormApi = ReturnType<typeof useEmployeeForm>['form'];
