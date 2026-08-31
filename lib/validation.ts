import { z } from "zod";
import { intents } from "./audit/types";

export const auditRequestSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "address must be a valid EVM address"),
  intent: z.enum(intents),
}).strict();
