export async function getPaywall() {
  const [{ base, solana, merchantConfig, Paywall }, { createCdpFacilitatorClient }] = await Promise.all([
    import("@seedhape/x402-merchant-sdk"), import("@coinbase/cdp-sdk/x402"),
  ]);
  const { persistReceipt } = await import("./receipts");
  const auditPayment = merchantConfig(base, {
  payTo: process.env.MERCHANT_WALLET || "0x0000000000000000000000000000000000000000",
  accepts: process.env.SOLANA_MERCHANT_WALLET ? [{ ...base, payTo: process.env.MERCHANT_WALLET || "0x0000000000000000000000000000000000000000" }, { ...solana, payTo: process.env.SOLANA_MERCHANT_WALLET, feePayer: process.env.SOLANA_FEE_PAYER }] : undefined,
  facilitator: { url: process.env.CDP_FACILITATOR_URL || "https://api.cdp.coinbase.com/platform/v2/x402", client: createCdpFacilitatorClient({
    apiKeyId: process.env.CDP_API_KEY_ID || "", apiKeySecret: process.env.CDP_API_KEY_SECRET || "",
  }) },
  paymentMethods: ["eip3009"], price: { amount: 50_000n, ...base }, browserPaywall: { appName: "Wallet Execution Guard", appLogo: `${process.env.PUBLIC_APP_URL || "http://localhost:3000"}/icon.svg`, testnet: false },
  description: "Inspect a Base wallet before an agent pays it. Returns ETH/USDC balances, wallet type, recent USDC transfers and approvals, known labels, and a proceed/caution/block recommendation with evidence.",
  route: { name: "Base Wallet Decision Report", description: "Inspect a Base wallet before an agent pays it. Returns ETH/USDC balances, wallet type, recent USDC transfers and approvals, known labels, and a proceed/caution/block recommendation with evidence.", category: "crypto", docsUrl: `${process.env.PUBLIC_APP_URL || "http://localhost:3000"}/docs`,
    inputSchema: { type: "object", properties: { address: { type: "string", format: "evm-address", description: "Base wallet address" }, intent: { type: "string", enum: ["counterparty", "self-audit", "pre-transaction", "portfolio"] } }, required: ["address", "intent"], additionalProperties: false, examples: [{ address: "0x0000000000000000000000000000000000000000", intent: "counterparty" }] },
    outputSchema: { type: "object", required: ["address", "network", "decision", "risk", "balances", "activity", "approvals", "transfers", "labels", "sanctions", "findings", "limitations"], properties: { address: { type: "string" }, network: { type: "string", const: "eip155:8453" }, decision: { type: "string", enum: ["proceed", "caution", "block", "unknown"] }, risk: { type: "object" }, balances: { type: "object" }, activity: { type: "object" }, approvals: { type: "array" }, transfers: { type: "array" }, labels: { type: "array" }, sanctions: { type: "object" }, findings: { type: "array" }, limitations: { type: "array" } }, examples: [{ address: "0x0000000000000000000000000000000000000000", network: "eip155:8453", decision: "proceed", risk: { score: 0, level: "low", confidence: "medium" }, balances: { ethWei: "0", usdcBaseUnits: "0" }, activity: { transactionCount: 0, recentTransfers: 0, recentApprovals: 0 }, approvals: [], transfers: [], labels: [], sanctions: { checked: false, status: "unavailable" }, findings: [], limitations: ["Sanctions screening is unavailable without a configured provider."] }] } },
  receipts: { record: persistReceipt },
  });
  return new Paywall(auditPayment);
}

export async function getPaymentConfig() {
  const [{ base, solana, merchantConfig }, { createCdpFacilitatorClient }] = await Promise.all([
    import("@seedhape/x402-merchant-sdk"), import("@coinbase/cdp-sdk/x402"),
  ]);
  const { persistReceipt } = await import("./receipts");
  return merchantConfig(base, {
    payTo: process.env.MERCHANT_WALLET || "0x0000000000000000000000000000000000000000",
    accepts: process.env.SOLANA_MERCHANT_WALLET ? [{ ...base, payTo: process.env.MERCHANT_WALLET || "0x0000000000000000000000000000000000000000" }, { ...solana, payTo: process.env.SOLANA_MERCHANT_WALLET, feePayer: process.env.SOLANA_FEE_PAYER }] : undefined,
    facilitator: { url: process.env.CDP_FACILITATOR_URL || "https://api.cdp.coinbase.com/platform/v2/x402", client: createCdpFacilitatorClient({ apiKeyId: process.env.CDP_API_KEY_ID || "", apiKeySecret: process.env.CDP_API_KEY_SECRET || "" }) },
    paymentMethods: ["eip3009"], price: { amount: 50_000n, ...base }, browserPaywall: { appName: "Wallet Execution Guard", appLogo: `${process.env.PUBLIC_APP_URL || "http://localhost:3000"}/icon.svg`, testnet: false },
    description: "Inspect a Base wallet before an agent pays it. Returns balances, wallet type, recent USDC transfers and approvals, known labels, and a proceed/caution/block recommendation with evidence.",
    route: { name: "Base Wallet Decision Report", description: "Inspect a Base wallet before an agent pays it. Returns balances, wallet type, recent USDC transfers and approvals, known labels, and a proceed/caution/block recommendation with evidence.", category: "crypto", docsUrl: `${process.env.PUBLIC_APP_URL || "http://localhost:3000"}/docs` },
    receipts: { record: persistReceipt },
  });
}
