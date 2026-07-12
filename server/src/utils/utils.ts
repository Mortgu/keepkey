export const formatDate = (date: Date | string | undefined | null): string | null => {
  if (date === undefined || date === null) return null
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const formatEur = (value: number): string => {
  return (
    value.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
};

export const formatDuration = (value: number): string => {
  switch (value) {
    case 12:
      return "1 Jahr";
    case 24:
      return "2 Jahre";
    case 36:
      return "3 Jahre";
    default:
      return "x Jahre";
  }
};

export const toDate = (val: string | null | undefined): Date | null => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};
