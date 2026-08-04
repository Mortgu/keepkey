import { createFileRoute } from '@tanstack/react-router';
import ContractPage from './-page';

export const Route = createFileRoute('/_main/contracts/')({
    component: ContractPage,
});
