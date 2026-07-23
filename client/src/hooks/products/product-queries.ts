import type { CreateOfferPositionInput } from "@keepit/schemas";
import { queryOptions } from "@tanstack/react-query";
import { getTariffPrice } from "../tariffs/tariff-api";
import { getProduct, getProducts } from "./product-api";
import { productKeys } from "./product-keys";

export const productQueries = {
    list: () => queryOptions({
        queryKey: productKeys.list(),
        queryFn: getProducts,
    }),

    detail: (id: string) => queryOptions({
        queryKey: productKeys.detail(id),
        queryFn: () => getProduct(id),
        enabled: Boolean(id),
    }),

    price: (customerId: string, workload: CreateOfferPositionInput) => queryOptions({
        queryKey: productKeys.price({
            customerId,
            productId: workload.productId,
            contractId: workload.contractId,
            duration_months: workload.duration_months,
            quantity: workload.quantity,
            free_months: workload.free_months,
        }),
        queryFn: () => getTariffPrice(workload.productId, workload.contractId, workload.duration_months, workload.quantity, customerId, workload.free_months),
        enabled: Boolean(customerId),
    })
};
