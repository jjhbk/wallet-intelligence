const tags = ["crypto", "evm", "solana-payments", "wallet-risk", "approvals", "counterparty", "agent-safety", "usdc"];

export function enrichMarketplaceChallenge(challenge: unknown) {
  if (!challenge || typeof challenge !== "object") return challenge;
  const value = challenge as Record<string, any>;
  const appUrl = process.env.PUBLIC_APP_URL || "http://localhost:3000";
  const iconUrl = `${appUrl}/icon.svg`;
  const logoUrl = `${appUrl}/logo.svg`;
  const serviceName = "WalletGuard";
  const bazaar = value.extensions?.bazaar || {};
  const info = bazaar.info || {};
  const method = String(info.input?.method || "POST").toUpperCase();
  const input = method === "POST"
    ? { type: "http", method: "POST", bodyType: "json", body: { address: "0x0000000000000000000000000000000000000000", intent: "counterparty" } }
    : { type: "http", method, queryParams: { address: "0x0000000000000000000000000000000000000000", intent: "counterparty" } };
  const schema = method === "POST" ? { $schema: "https://json-schema.org/draft/2020-12/schema", type: "object", properties: { input: { type: "object", properties: { type: { const: "http" }, method: { const: "POST" }, bodyType: { const: "json" }, body: { type: "object", properties: { address: { type: "string" }, intent: { type: "string" } }, required: ["address", "intent"] } }, required: ["type", "method", "bodyType", "body"] } }, required: ["input"] } : bazaar.schema;
  value.resource = { ...(value.resource || {}), serviceName, tags };
  const description = "WalletGuard preflights wallet and transaction execution across major EVM chains, returning balances, activity, approvals, known labels, and a proceed/caution/block recommendation with evidence.";
  value.extensions = { ...(value.extensions || {}), bazaar: { ...bazaar, category: "crypto", tags, iconUrl, logoUrl,
    info: { ...info, name: serviceName, serviceName, description, iconUrl, logoUrl, input,
      output: { type: "json", example: {
        address: "0x0000000000000000000000000000000000000000",
        network: "eip155:8453",
        observedAt: "2026-01-01T00:00:00.000Z",
        walletType: "eoa",
        decision: "caution",
        risk: { score: 25, level: "medium", confidence: "medium" },
        recommendedAction: "request_human_confirmation",
        summary: "Reviewable wallet signals were found.",
        balances: { ethWei: "0", usdcBaseUnits: "0" },
        activity: { transactionCount: 1, recentTransfers: 0, recentApprovals: 0 },
        approvals: [],
        transfers: [],
        labels: [],
        sanctions: { checked: false, status: "unavailable" },
        findings: [],
        limitations: ["Sanctions screening is unavailable without a configured provider."]
      } } }, ...(schema ? { schema } : {}) } };
  value.resource.description = description;
  value.serviceName = serviceName;
  value.tags = tags;
  value.iconUrl = iconUrl;
  value.logoUrl = logoUrl;
  return value;
}

export function encodePaymentRequired(challenge: unknown) {
  return Buffer.from(JSON.stringify(enrichMarketplaceChallenge(challenge)), "utf8").toString("base64");
}
