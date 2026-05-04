import Button from "@/components/button/button";
import type { DocumentJob } from "@/data/types";
import { formatDate } from "@/lib/format";
import { Cloud, File, FileDown, RotateCw } from "lucide-react";

export default function OfferFile({ document }: { document: DocumentJob }) {
  return (
    <div className="flex items-center justify-between border border-(--border) py-2 px-4 rounded-md">
      <div className="flex items-center gap-3">
        <File className="size-4" />
        <div className="grid">
          <p className="text-sm">260000_AG_Kunde_keepit-workloads.pdf</p>
          <div className="flex font-light text-sm gap-4 text-(--text-secondary)">
            <p>{formatDate(document.createdAt)}</p>
            <p>{document.status}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          icon={<RotateCw className="size-3.5" />}
          size="sm"
        >
          Neu
        </Button>
        <Button
          variant="secondary"
          icon={<Cloud className="size-3.5" />}
          size="sm"
        >
          NextCloud
        </Button>
        <Button
          variant="secondary"
          icon={<FileDown className="size-4" />}
          size="sm"
          iconOnly
        />
      </div>
    </div>
  );
}
