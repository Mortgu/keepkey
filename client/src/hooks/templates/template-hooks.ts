import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    activateTemplate,
    deleteTemplate,
    renameTemplate,
    replaceTemplateContent,
    uploadTemplate,
    type UploadTemplateInput,
} from "./template-api";
import { templateKeys } from "./template-keys";
import { templateQueries } from "./template-queries";

export function useTemplates() {
    return useQuery(templateQueries.list());
}

export function useTemplateMutations() {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: templateKeys.lists() });

    const uploadMutation = useMutation({
        mutationFn: (input: UploadTemplateInput) => uploadTemplate(input),
        onSuccess: invalidate,
    });

    const replaceContentMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => replaceTemplateContent(id, file),
        onSuccess: (_result, { id }) => {
            queryClient.removeQueries({ queryKey: templateKeys.content(id) });
            return invalidate();
        },
    });

    const renameMutation = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => renameTemplate(id, name),
        onSuccess: invalidate,
    });

    const activateMutation = useMutation({
        mutationFn: (id: string) => activateTemplate(id),
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteTemplate(id),
        onSuccess: invalidate,
    });

    return {
        uploadTemplate: uploadMutation.mutateAsync,
        isUploadingTemplate: uploadMutation.isPending,

        replaceTemplateContent: replaceContentMutation.mutateAsync,
        isReplacingTemplateContent: replaceContentMutation.isPending,

        renameTemplate: renameMutation.mutateAsync,
        isRenamingTemplate: renameMutation.isPending,

        activateTemplate: activateMutation.mutateAsync,
        isActivatingTemplate: activateMutation.isPending,

        deleteTemplate: deleteMutation.mutateAsync,
        isDeletingTemplate: deleteMutation.isPending,
    };
}
