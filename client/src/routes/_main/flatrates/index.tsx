import { createFileRoute } from '@tanstack/react-router';
import FlatratePage from './-page';

export const Route = createFileRoute('/_main/flatrates/')({
    component: FlatratePage,
});

