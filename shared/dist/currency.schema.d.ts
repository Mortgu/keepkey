import { z } from "zod";
export declare const currencySchema: z.ZodEnum<{
    EUR: "EUR";
    RAND: "RAND";
    DOLLAR: "DOLLAR";
    CHF: "CHF";
}>;
export type Currency = z.infer<typeof currencySchema>;
//# sourceMappingURL=currency.schema.d.ts.map