import { queryOptions } from "@tanstack/react-query";
import { getTariffPrice } from "../tariffs/tariff-api";
import { getProduct, getProducts } from "./product-api";
import { productKeys } from "./product-keys";
import type { CreateOfferPositionInput } from "@keepit/schemas";

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

    price: (customerId: string, workload: CreateOfferPositionInput) => {
        const params = {
            customerId,
            productId: workload.productId,
            contractId: workload.contractId,
            duration_months: workload.duration_months,
            quantity: workload.quantity,
            free_months: workload.free_months,
        };
        const isValid =
            Number.isInteger(params.quantity) && params.quantity > 0 &&
            Number.isInteger(params.duration_months) && params.duration_months > 0 &&
            Number.isInteger(params.free_months) && params.free_months >= 0 &&
            params.free_months <= params.duration_months;
        return queryOptions({
            queryKey: productKeys.price(params),
            queryFn: () => getTariffPrice(params.productId, params.contractId, params.duration_months, params.quantity, params.customerId, params.free_months),
            enabled: Boolean(customerId) && isValid,
            staleTime: 0,
        });
    }
};
