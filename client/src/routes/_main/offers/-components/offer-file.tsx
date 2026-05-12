import { formatDate } from "@/lib/format";
import { formatStatus } from "@/utils/utils";

import { Cloud, File, FileDown, RotateCw } from "lucide-react";
import { Button, Badge } from "@/components";

import type { Task } from "@/types";

export default function OfferFile({ document }: { document: Task }) {
  return (
    <div className="flex items-center justify-between border border-(--border) py-2 px-4 rounded-md">
      <div className="flex items-center gap-3">
        <File className="size-4" />
        <div className="grid gap-1">
          <p className="text-sm">260000_AG_Kunde_keepit-workloads.pdf</p>
          <div className="flex font-light text-sm gap-2 text-(--text-secondary)">
            <p>{formatDate(document?.createdAt || "")}</p>
            <Badge variant={formatStatus(document.status)} />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="secondary" icon={<RotateCw className="size-3.5" />} size="sm">
          Neu
        </Button>

        <Button variant="secondary" icon={<Cloud className="size-3.5" />} size="sm">
          NextCloud
        </Button>

        <Button variant="secondary" icon={<FileDown className="size-4" />} size="sm" iconOnly />
      </div>
    </div>
  );
}
