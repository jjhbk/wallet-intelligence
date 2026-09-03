export async function renderBrowserPaywall(paymentRequired: unknown, currentUrl: string) {
  const { renderBrowserPaywall: render } = await import("@seedhape/x402-merchant-sdk");
  return render({ paymentRequired, accept: "text/html", config: { appName: "Wallet Execution Guard", currentUrl, testnet: false } });
}
