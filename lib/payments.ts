export async function getPaywall() {
  const [{ base, merchantConfig, Paywall }, { createCdpFacilitatorClient }] = await Promise.all([
    import("@seedhape/x402-merchant-sdk"), import("@coinbase/cdp-sdk/x402"),
  ]);
  const auditPayment = merchantConfig(base, {
  payTo: process.env.MERCHANT_WALLET || "0x0000000000000000000000000000000000000000",
  facilitator: { url: process.env.CDP_FACILITATOR_URL || "https://api.cdp.coinbase.com/platform/v2/x402", client: createCdpFacilitatorClient({
    apiKeyId: process.env.CDP_API_KEY_ID || "", apiKeySecret: process.env.CDP_API_KEY_SECRET || "",
  }) },
  paymentMethods: ["eip3009"], price: { amount: 50_000n, ...base },
  description: "Evidence-backed Base wallet audit for agents.",
  route: { name: "Base Wallet Decision Report", description: "Audit a Base wallet before an agent sends funds or accepts a counterparty.", category: "crypto", docsUrl: `${process.env.PUBLIC_APP_URL || "http://localhost:3000"}/docs`,
    inputSchema: { type: "object", properties: { address: { type: "string", format: " evm-address" }, intent: { type: "string", enum: ["counterparty", "self-audit", "pre-transaction", "portfolio"] } }, required: ["address", "intent"], additionalProperties: false },
    outputSchema: { type: "object", description: "Decision report with evidence-backed findings and limitations." } },
  });
  return new Paywall(auditPayment);
}
