import {createFileRoute} from '@tanstack/react-router'
import SupplierList from './-components/supplier-list'
import {PageWidth} from '@/components'

export const Route = createFileRoute('/_main/suppliers/')({
    component: () => (
        <PageWidth>
            <SupplierList/>
        </PageWidth>
    ),
})
