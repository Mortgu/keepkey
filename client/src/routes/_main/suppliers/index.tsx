import { createFileRoute } from '@tanstack/react-router'
import SupplierPage from './-page'

export const Route = createFileRoute('/_main/suppliers/')({
    component: SupplierPage,
})
