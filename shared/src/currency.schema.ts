import { z } from "zod";

export const currencySchema = z.enum(["EUR", "RAND", "DOLLAR", "CHF"]);

export type Currency = z.infer<typeof currencySchema>;
