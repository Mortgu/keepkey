import { updateSettingAction } from "@/data/settings-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSettingsHook = () => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["settings"] });

    const updateSettingMutation = useMutation({
        mutationFn: ({ key, value }: { key: String, value: String }) => updateSettingAction(key, value),
        onSuccess: invalidate,
    });

    return {
        updateSetting: updateSettingMutation.mutateAsync,
        isUpdatingSetting: updateSettingMutation.isPending,
        errorUpdatingSetting: updateSettingMutation.error,
    }
}