import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { Order, OrderRevision } from "@/types";
import { Button, Drawer } from "@/components";
import { useOrderRevisions, useRestoreOrderRevision } from "@/hooks";
import { formatDate } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  order: Order;
};

export default function OrderDrawerHistory({ open, onClose, order }: Props) {
  const { t } = useTranslation();
  const { revisions: revisions = [], isPending, error } = useOrderRevisions(order.id);
  const {
    restoreOrderRevision,
    isRestoringRevision,
    restoringRevisionId,
    errorRestoringRevision,
  } = useRestoreOrderRevision();

  useEffect(() => {
    if (errorRestoringRevision) toast.error(errorRestoringRevision.message);
  }, [errorRestoringRevision]);

  const restore = async (revision: OrderRevision) => {
    if (!confirm(t("versionHistory.restoreConfirm", { version: revision.version }))) return;
    try {
      await restoreOrderRevision({
        orderId: order.id,
        revisionId: revision.id,
        expectedVersion: order.version,
      });
      toast.success(t("versionHistory.restoreSuccess"));
    } catch {
      // The mutation error is surfaced by the effect above.
    }
  };

  return (
    <Drawer open={open} onClose={onClose} wide>
      <Drawer.Header title={t("versionHistory.title")} subtitle={t("versionHistory.orderSubtitle")} />
      <Drawer.Body>
        <div className="mb-3 rounded-md border border-(--border) px-3 py-2 text-sm">
          {t("versionHistory.currentVersion", { version: order.version })}
        </div>
        {isPending && <p className="text-sm text-(--text-secondary)">{t("common.loading")}</p>}
        {error && <p className="text-sm text-red-600">{error.message}</p>}
        {!isPending && !error && revisions.length === 0 && (
          <p className="text-sm text-(--text-secondary)">{t("versionHistory.empty")}</p>
        )}
        {revisions.map((revision) => (
          <div key={revision.id} className="flex items-center justify-between gap-3 border-b border-(--border) py-3 last:border-0">
            <div>
              <p className="text-sm font-semibold">v{revision.version}</p>
              <p className="text-xs text-(--text-secondary)">
                {formatDate(revision.createdAt)} · {revision.changedBy.name}
              </p>
            </div>
            <Button
              size="xs"
              variant="secondary"
              onClick={() => restore(revision)}
              loading={isRestoringRevision && restoringRevisionId === revision.id}
              disabled={isRestoringRevision}
            >
              {t("versionHistory.restore")}
            </Button>
          </div>
        ))}
      </Drawer.Body>
    </Drawer>
  );
}
