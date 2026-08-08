import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    confirmReplacementUpload,
    deleteDocument,
    putReplacementFile,
    renameDocument,
    requestReplacementUpload,
    resyncDocument,
    uploadDocument,
} from "./document-api";
import type { DocumentFormatParam, DocumentType } from "@keepit/schemas";
import { offerKeys } from "@/hooks/offers/offers-keys";
import { orderKeys } from "@/hooks/orders/order-keys";

const invalidate = (queryClient: QueryClient, type: DocumentType, parentId: string) => {
    if (type === "offer") {
        queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
        queryClient.invalidateQueries({ queryKey: offerKeys.detail(parentId) });
    } else {
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    }
};

export function useDocumentMutations(type: DocumentType, parentId: string) {
    const queryClient = useQueryClient();


    const renameMutation = useMutation({
        mutationFn: ({ documentId, displayName }: { documentId: string; displayName: string }) =>
            renameDocument(type, documentId, displayName),
        onSuccess: () => invalidate(queryClient, type, parentId),
    });

    const deleteMutation = useMutation({
        mutationFn: (documentId: string) => deleteDocument(type, documentId),
        onSuccess: () => invalidate(queryClient, type, parentId),
    });

    const uploadMutation = useMutation({
        mutationFn: (documentId: string) => uploadDocument(type, documentId),
        onSuccess: () => invalidate(queryClient, type, parentId),
    });

    /**
     * Ersetzt die erzeugte Datei: URL anfordern, direkt nach S3 hochladen,
     * bestätigen. Nextcloud bleibt dabei unberührt — liegt das Dokument dort
     * schon, wird die Abweichung anschließend in der Karte angezeigt.
     */
    const replaceMutation = useMutation({
        mutationFn: async ({ documentId, format, file }: {
            documentId: string;
            format: DocumentFormatParam;
            file: File;
        }) => {
            const upload = await requestReplacementUpload(type, documentId, format);
            await putReplacementFile(upload, file);
            return confirmReplacementUpload(type, documentId, format, upload.objectKey);
        },
        onSuccess: () => invalidate(queryClient, type, parentId),
    });

    const resyncMutation = useMutation({
        mutationFn: (documentId: string) => resyncDocument(type, documentId),
        onSuccess: () => invalidate(queryClient, type, parentId),
    });

    return {
        replaceDocumentFile: replaceMutation.mutateAsync,
        isReplacingDocumentFile: replaceMutation.isPending,
        errorReplacingDocumentFile: replaceMutation.error,
        resyncDocument: resyncMutation.mutateAsync,
        isResyncingDocument: resyncMutation.isPending,
        errorResyncingDocument: resyncMutation.error,
        renameDocument: renameMutation.mutateAsync,
        isRenamingDocument: renameMutation.isPending,
        errorRenamingDocument: renameMutation.error,
        deleteDocument: deleteMutation.mutateAsync,
        isDeletingDocument: deleteMutation.isPending,
        errorDeletingDocument: deleteMutation.error,
        uploadDocument: uploadMutation.mutateAsync,
        isUploadingDocument: uploadMutation.isPending,
        errorUploadingDocument: uploadMutation.error,
    };
}

export function useUploadDocument(type: DocumentType, parentId: string) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (documentId: string) => uploadDocument(type, documentId),
        onSuccess: () => invalidate(queryClient, type, parentId),
    });

    return {
        uploadDocument: mutation.mutateAsync,
        isUploadingDocument: mutation.isPending,
        errorUploadingDocument: mutation.error,
    }
}