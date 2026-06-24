import { createFileRoute } from '@tanstack/react-router';
import ProductPage from "@/routes/_main/workloads/-page.tsx";

export const Route = createFileRoute('/_main/workloads/')({
    component: ProductPage,
})
