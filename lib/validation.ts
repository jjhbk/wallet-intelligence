import { z } from "zod";
import { intents } from "./audit/types";

export const auditRequestSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "address must be a valid EVM address"),
  intent: z.enum(intents),
  chain: z.string().optional().default("base"),
  transaction: z.object({ to: z.string().regex(/^0x[a-fA-F0-9]{40}$/), value: z.string().optional(), data: z.string().regex(/^0x[0-9a-fA-F]*$/).optional(), gasLimit: z.string().optional() }).optional(),
}).strict();
