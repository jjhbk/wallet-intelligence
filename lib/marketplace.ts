const tags = ["crypto", "base", "wallet-risk", "approvals", "counterparty", "agent-safety", "usdc"];

export function enrichMarketplaceChallenge(challenge: unknown) {
  if (!challenge || typeof challenge !== "object") return challenge;
  const value = challenge as Record<string, any>;
  const iconUrl = `${process.env.PUBLIC_APP_URL || "http://localhost:3000"}/icon.svg`;
  const bazaar = value.extensions?.bazaar || {};
  const info = bazaar.info || {};
  const method = String(info.input?.method || "POST").toUpperCase();
  const input = method === "POST"
    ? { type: "http", method: "POST", bodyType: "json", body: { address: "0x0000000000000000000000000000000000000000", intent: "counterparty" } }
    : { type: "http", method, queryParams: { address: "0x0000000000000000000000000000000000000000", intent: "counterparty" } };
  const schema = method === "POST" ? { $schema: "https://json-schema.org/draft/2020-12/schema", type: "object", properties: { input: { type: "object", properties: { type: { const: "http" }, method: { const: "POST" }, bodyType: { const: "json" }, body: { type: "object", properties: { address: { type: "string" }, intent: { type: "string" } }, required: ["address", "intent"] } }, required: ["type", "method", "bodyType", "body"] } }, required: ["input"] } : bazaar.schema;
  value.resource = { ...(value.resource || {}), serviceName: "Base Wallet Decision Report", tags };
  const description = "Inspect a Base wallet before an agent pays it. Returns balances, wallet type, recent USDC transfers and approvals, known labels, and a proceed/caution/block recommendation with evidence.";
  value.extensions = { ...(value.extensions || {}), bazaar: { ...bazaar, category: "crypto", tags, iconUrl,
    info: { ...info, name: "Base Wallet Decision Report", serviceName: "Base Wallet Decision Report", description, iconUrl, input,
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
  value.serviceName = "Base Wallet Decision Report";
  value.tags = tags;
  value.iconUrl = iconUrl;
  return value;
}

export function encodePaymentRequired(challenge: unknown) {
  return Buffer.from(JSON.stringify(enrichMarketplaceChallenge(challenge)), "utf8").toString("base64");
}
