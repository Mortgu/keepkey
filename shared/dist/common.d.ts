import { z } from "zod";
export declare const isoDateTime: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
//# sourceMappingURL=common.d.ts.map