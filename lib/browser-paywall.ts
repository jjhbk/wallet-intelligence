export async function renderBrowserPaywall(paymentRequired: unknown, currentUrl: string) {
  const [{ createPaywall }, { evmPaywall }] = await Promise.all([
    import("@x402/paywall"), import("@x402/paywall/evm"),
  ]);
  const paywall = createPaywall().withNetwork(evmPaywall).withConfig({
    appName: "Base Wallet Decision Report", currentUrl, testnet: false,
  }).build();
  return paywall.generateHtml(paymentRequired as Parameters<typeof paywall.generateHtml>[0]);
}
