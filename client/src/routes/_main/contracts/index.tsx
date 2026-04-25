import { createFileRoute } from '@tanstack/react-router'
import ContractList from './-components/contract-list'

export const Route = createFileRoute('/_main/contracts/')({
    component: ContractList,
});
