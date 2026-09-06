import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { Input } from "./input";

type Props = {
  initialValue: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (displayName: string) => Promise<unknown>;
};

export function DocumentRenameModal({ initialValue, isPending, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
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
    <Dialog
      defaultOpen
      size="sm"
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <Dialog.Header title="Dokument umbenennen" />
      <Dialog.Body>
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
      </Dialog.Body>
      <Dialog.Footer>
        <Button variant="border" size="sm" onClick={onClose} disabled={isPending}>
          {t("button.cancel")}
        </Button>
        <Button size="sm" onClick={submit} loading={isPending} disabled={!value || isPending}>
          {t("button.save")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
