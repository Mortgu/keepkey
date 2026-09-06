import { createFileRoute } from '@tanstack/react-router';
import TemplatePage from './-page';

export const Route = createFileRoute('/_main/templates/')({
    component: TemplatePage,
});