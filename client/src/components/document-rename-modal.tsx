import { useState } from "react";
import { Button, Input, ModalDialog } from "@/components";

type Props = {
  initialValue: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (displayName: string) => Promise<unknown>;
};

export function DocumentRenameModal({ initialValue, isPending, onClose, onSubmit }: Props) {
  const [displayName, setDisplayName] = useState(initialValue);
  const value = displayName.trim();

  const submit = async () => {
    if (!value) return;
    try {
      await onSubmit(value);
      onClose();
    } catch {
      // The owning card displays the mutation error and keeps the modal open.
    }
  };

  return (
    <ModalDialog onClose={onClose}>
      <ModalDialog.Header>
        <h1 className="text-lg">Dokument umbenennen</h1>
      </ModalDialog.Header>
      <ModalDialog.Content>
        <Input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={180}
          autoFocus
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void submit();
            }
          }}
        />
      </ModalDialog.Content>
      <ModalDialog.Footer>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isPending}>
          Abbrechen
        </Button>
        <Button size="sm" onClick={submit} loading={isPending} disabled={!value || isPending}>
          Speichern
        </Button>
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
