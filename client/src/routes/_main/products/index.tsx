import {createFileRoute} from '@tanstack/react-router'
import ProductPage from "@/routes/_main/products/-page.tsx";

export const Route = createFileRoute('/_main/products/')({
    component: ProductPage,
})
