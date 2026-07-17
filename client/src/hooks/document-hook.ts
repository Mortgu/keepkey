import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offerKeys } from "./offers/offers-keys";
import { orderKeys } from "./orders/order-keys";
import type { DocumentType } from "@/types";
import {
  deleteDocument,
  renameDocument,
  uploadDocument,
} from "@/data/documents";

export function useDocumentMutations(type: DocumentType, parentId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (type === "offer") {
      queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: offerKeys.detail(parentId) });
    } else {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    }
  };

  const renameMutation = useMutation({
    mutationFn: ({ documentId, displayName }: { documentId: string; displayName: string }) =>
      renameDocument(type, documentId, displayName),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => deleteDocument(type, documentId),
    onSuccess: invalidate,
  });
  const uploadMutation = useMutation({
    mutationFn: (documentId: string) => uploadDocument(type, documentId),
    onSuccess: invalidate,
  });

  return {
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
