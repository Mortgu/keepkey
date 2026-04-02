import { getAllOrdersAction } from "@/data/orders";
import { createProductAction, deleteProductAction, getAllProducts, updateProductAction } from "@/data/products";
import { getAllUsersAction } from "@/data/user";
import type { ProductItemProps } from "@/routes/admin/_adminLayout/products/-components/product-item";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useAdmin = () => {
    const queryClient = useQueryClient();

    /* Admin Orders */
    const { data: orders = [], isPending: pendingOrders, error: errorOrders } = useQuery({
        queryKey: ['admin:orders'],
        queryFn: getAllOrdersAction,
    });

    /* Admin Products */
    const { data: products = [], isPending: pendingProducts, error: errorProducts } = useQuery({
        queryKey: ['admin:products'],
        queryFn: getAllProducts,
    });

    const createProductMutation = useMutation({
        mutationFn: createProductAction,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin:products'],
            })
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, product }: { id: string; product: Partial<ProductItemProps> }) =>
            updateProductAction(id, product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin:products'] });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id: string) => deleteProductAction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['products'],
            })
        }
    });

    /* Admin Contracts */
    const { data: contracts = [], isPending: pendingContracts, error: errorContracts } = useQuery({
        queryKey: ['admin:contracts'],
        queryFn: () => { },
    });

    const { data: users = [], isPending: pendingUsers, error: errorUsers } = useQuery({
        queryKey: ['admin:users'],
        queryFn: getAllUsersAction,
    });

    return {
        orders,
        pendingOrders,
        errorOrders,

        products,
        pendingProducts,
        errorProducts,
        createProduct: createProductMutation.mutateAsync,
        updateProduct: updateProductMutation.mutate,
        deleteProduct: deleteProductMutation.mutate,
        isCreatingProduct: createProductMutation.isPending,
        isDeletingProduct: deleteProductMutation.isPending,

        contracts,
        pendingContracts,
        errorContracts,

        users,
        pendingUsers,
        errorUsers,
    }
}