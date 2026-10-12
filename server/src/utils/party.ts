type PartyInput = {
  salutation: string | null | undefined;
  firstName: string;
  lastName: string;
  phone: string | null | undefined;
  email: string | null | undefined;
};

type Party = {
  salutation: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
};

/**
 * Builds the name fields shared by every customer-contact and employee
 * presentation across offers, orders and invoices. Guards and trims
 * `salutation` defensively — not every entity's schema guarantees it's
 * non-null, and the two that do aren't guaranteed to stay that way.
 */
export function formatParty(input: PartyInput): Party {
  const salutation = input.salutation ?? "";
  return {
    salutation,
    firstName: input.firstName,
    lastName: input.lastName,
    fullName: `${salutation} ${input.firstName} ${input.lastName}`.trim(),
    phone: input.phone ?? "",
    email: input.email ?? "",
  };
}
