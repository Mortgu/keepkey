import { createFileRoute } from '@tanstack/react-router'
import {SignupFormComponent} from "@/routes/signup/-components/signup-form.tsx";

export const Route = createFileRoute('/signup/')({
  component: SignupFormComponent,
});