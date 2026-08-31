import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createPaidMcpTool } from "@seedhape/x402-merchant-sdk";
import { z } from "zod";
import { inspectWallet } from "../../../lib/audit/provider";
import { buildReport } from "../../../lib/audit/scoring";
import { getPaymentConfig } from "../../../lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const server = new McpServer({ name: "base-wallet-audit", version: "0.1.0" });
  const config = await getPaymentConfig();
  await createPaidMcpTool(server, config, {
    name: "audit_base_wallet",
    description: "Inspect a Base wallet before an agent pays it. Returns balances, wallet type, recent USDC transfers and approvals, known labels, and a proceed/caution/block recommendation with evidence.",
    inputSchema: { address: z.string().regex(/^0x[a-fA-F0-9]{40}$/), intent: z.enum(["counterparty", "self-audit", "pre-transaction", "portfolio"]) },
    inputJsonSchema: { type: "object", properties: { address: { type: "string", format: "evm-address" }, intent: { type: "string" } }, required: ["address", "intent"] },
    outputJsonSchema: { type: "object", description: "Evidence-backed Base wallet decision report." }, tags: ["crypto", "base", "wallet-risk", "agent-safety"], resourceUrl: "mcp://tool/audit_base_wallet",
  }, async (args) => {
    const { address } = args as { address: string; intent: string };
    return buildReport(await inspectWallet(address));
  });
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  return transport.handleRequest(request);
}
