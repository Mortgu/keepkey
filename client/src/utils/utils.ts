import type { TaskStatus } from "@keepit/schemas";

export const formatEur = (cent: number): string => {
  cent = cent / 100;
  return (
    cent.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
};

/**
 * Preise werden durchgehend in Cent gespeichert und übertragen, in der
 * Oberfläche aber in Euro eingegeben. Beide Richtungen liegen hier neben
 * {@link formatEur}, damit keine Eingabemaske ihre eigene Umrechnung erfindet —
 * eine vergessene Umrechnung ist ein Faktor-100-Fehler am Preis.
 */
export const eurToCents = (eur: number): number => Math.round(eur * 100);

export const centsToEur = (cent: number): number => cent / 100;

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

export type RemainingTerm = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  expired: boolean;
};

const MS_PER_DAY = 86_400_000;

const startOfDay = (d: Date) =>
  Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

export function getRemainingTerm(from: Date | string, until: Date | string): RemainingTerm {
  const start = typeof from === "string" ? new Date(from) : from;
  const end = typeof until === "string" ? new Date(until) : until;

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new RangeError("Ungültiges Datum");
  }

  const totalDays = Math.round((startOfDay(end) - startOfDay(start)) / MS_PER_DAY);

  if (totalDays <= 0) {
    return { years: 0, months: 0, days: 0, totalDays: 0, expired: true };
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    // letzter Tag des Vormonats von `end`
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days, totalDays, expired: false };
}

export type Duration = {
  years?: number;
  months?: number;
  days?: number;
};

/** Addiert eine Dauer auf ein Datum, mit Clamping am Monatsende. */
export function addDuration(date: Date, duration: Duration): Date {
  const { years = 0, months = 0, days = 0 } = duration;

  const targetYear = date.getFullYear() + years;
  const targetMonth = date.getMonth() + months;

  // letzter Tag des Zielmonats -> verhindert Überlauf (31.01. + 1 Monat)
  const lastDayOfTarget = new Date(targetYear, targetMonth + 1, 0).getDate();
  const clampedDay = Math.min(date.getDate(), lastDayOfTarget);

  const result = new Date(date);
  result.setFullYear(targetYear, targetMonth, clampedDay);
  result.setDate(result.getDate() + days);

  return result;
}

export type TermStatus = RemainingTerm & {
  endDate: Date;
};

export function getRemainingTermFromStart(
  start: Date | string,
  duration: Duration,
  now: Date = new Date(),
): TermStatus {
  const startDate = typeof start === "string" ? new Date(start) : start;

  if (Number.isNaN(startDate.getTime())) {
    throw new RangeError("Ungültiges Startdatum");
  }

  const endDate = addDuration(startDate, duration);

  return {
    ...getRemainingTerm(now, endDate),
    endDate,
  };
}