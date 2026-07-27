import { z } from "zod";
/*
 * Wire format for entity timestamps: accepts a Prisma Date (server-side parse)
 * or an already-serialized ISO string, always outputs the ISO string the
 * client actually receives over JSON.
 */
export const isoDateTime = z
    .union([z.date(), z.iso.datetime()])
    .transform((d) => (typeof d === "string" ? d : d.toISOString()));
//# sourceMappingURL=common.js.map