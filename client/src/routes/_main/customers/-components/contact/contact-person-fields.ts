import { z } from "zod";
import type { TranslationKey } from "@/i18n";

/* Gemeinsame Pflichtfelder einer Kontaktperson für Kontakt- und Kunden-Modal.
 * Die E-Mail-Regel unterscheidet sich je Modal und wird dort ergänzt. */
export const contactPersonNameFields = {
    salutation: z.string().min(1, "customer.validation.salutationMissing" satisfies TranslationKey),
    firstName: z.string().min(1, "customer.validation.firstNameMissing" satisfies TranslationKey),
    lastName: z.string().min(1, "customer.validation.lastNameMissing" satisfies TranslationKey),
};
