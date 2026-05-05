import type { TaskStatus } from "@/types";

export const formatEur = (cent: number): string => {
  cent = cent / 100;
  return (
    cent.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
};

export const formatStatus = (status: TaskStatus) => {
  switch (status) {
    case "COMPLETED":
      return "generated";
    case "PENDING":
      return "pending";
    case "RUNNING":
      return "processing";
    case "FAILED":
      return "failed";
  }
};
