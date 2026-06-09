import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CreateTariffConfigInput,
  CreateTariffCustomerInput,
  CreateTariffInput,
  UpdateTariffConfigInput,
  UpdateTariffCustomerInput,
  UpdateTariffInput,
} from "@/types";

import {
  addTariffConfigAction,
  addTariffCustomerAction,
  createTariffAction,
  deleteTariffAction,
  deleteTariffConfigAction,
  deleteTariffCustomerAction,
  getAllTariffsAction,
  updateTariffAction,
  updateTariffConfigAction,
  updateTariffCustomerAction,
} from "@/data/tariffs";

export const useTariffHook = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["tariffs"] });

  const { data: tariffs = [], isPending, error } = useQuery({
    queryKey: ["tariffs"],
    queryFn: getAllTariffsAction,
  });

  const createMutation = useMutation({
    mutationFn: (body: CreateTariffInput) => createTariffAction(body),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTariffInput }) =>
      updateTariffAction(id, body),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteTariffAction(id),
    onSuccess: invalidate,
  });

  const addConfigMutation = useMutation({
    mutationFn: ({
      tariffId,
      body,
    }: {
      tariffId: string;
      body: CreateTariffConfigInput;
    }) => addTariffConfigAction(tariffId, body),
    onSuccess: invalidate,
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ tariffId, configId, body }: {
      tariffId: string; configId: string; body: UpdateTariffConfigInput;
    }) => updateTariffConfigAction(tariffId, configId, body),
    onSuccess: invalidate,
  });

  const deleteConfigMutation = useMutation({
    mutationFn: ({ tariffId, configId }: {
      tariffId: string; configId: string;
    }) => deleteTariffConfigAction(tariffId, configId),
    onSuccess: invalidate,
  });

  const addCustomerMutation = useMutation({
    mutationFn: ({ tariffId, body }: {
      tariffId: string; body: CreateTariffCustomerInput;
    }) => addTariffCustomerAction(tariffId, body),
    onSuccess: invalidate,
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({
      tariffId,
      tariffCustomerId,
      body,
    }: {
      tariffId: string;
      tariffCustomerId: string;
      body: UpdateTariffCustomerInput;
    }) => updateTariffCustomerAction(tariffId, tariffCustomerId, body),
    onSuccess: invalidate,
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: ({
      tariffId,
      tariffCustomerId,
    }: {
      tariffId: string;
      tariffCustomerId: string;
    }) => deleteTariffCustomerAction(tariffId, tariffCustomerId),
    onSuccess: invalidate,
  });

  return {
    tariffs,
    isPending,
    error,

    createTariff: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    errorCreatingTariff: createMutation.error,

    updateTariff: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteTariff: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,

    addConfig: addConfigMutation.mutateAsync,
    isAddingConfig: addConfigMutation.isPending,

    updateConfig: updateConfigMutation.mutateAsync,
    isUpdatingConfig: updateConfigMutation.isPending,

    deleteConfig: deleteConfigMutation.mutate,
    isDeletingConfig: deleteConfigMutation.isPending,

    addCustomerOverride: addCustomerMutation.mutateAsync,
    isAddingCustomerOverride: addCustomerMutation.isPending,

    updateCustomerOverride: updateCustomerMutation.mutateAsync,
    isUpdatingCustomerOverride: updateCustomerMutation.isPending,

    deleteCustomerOverride: deleteCustomerMutation.mutate,
    isDeletingCustomerOverride: deleteCustomerMutation.isPending,
  };
};
