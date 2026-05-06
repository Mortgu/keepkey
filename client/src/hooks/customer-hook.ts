import {
  createCustomerAction,
  deleteCustomerAction,
  getAllCustomersAction,
  updateCustomerByIdAction,
} from "@/data/customers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateCustomerInput, UpdateCustomerInput } from "@/types";

export const useCustomerHook = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["customers"] });

  const {
    data: customers = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: getAllCustomersAction,
  });

  const createMutation = useMutation({
    mutationFn: (body: CreateCustomerInput) => createCustomerAction(body),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCustomerInput }) =>
      updateCustomerByIdAction(id, body),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteCustomerAction(id),
    onSuccess: invalidate,
  });

  return {
    customers,
    isPending,
    error,

    createCustomer: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    errorCreatingCustomer: createMutation.error,

    updateCustomer: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    deleteCustomer: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
