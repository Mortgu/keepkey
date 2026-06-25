import { createFileRoute } from '@tanstack/react-router'
import ContractList from './-components/contract-list'
import { PageWidth } from '@/components'

export const Route = createFileRoute('/_main/contracts/')({
    component: () => (
        <PageWidth>
            <ContractList />
        </PageWidth>
    ),
});
