import { createFileRoute } from '@tanstack/react-router'
import { SignupFormComponent } from "./-components/signup-form.tsx";

export const Route = createFileRoute('/_main/signup/')({
  component: SignupFormComponent,
});