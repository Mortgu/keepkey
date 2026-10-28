import { createFileRoute } from '@tanstack/react-router';
import FlowPage from './-page';

export const Route = createFileRoute('/_main/customers/$customerId/$offerId/')({
    component: FlowPage,
});
