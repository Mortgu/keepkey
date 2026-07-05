import { createFileRoute } from '@tanstack/react-router';
import { InvoicePage } from './-page';

export const Route = createFileRoute('/_main/invoices/')({
    component: InvoicePage,
});