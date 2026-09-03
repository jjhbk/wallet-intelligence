export default function DocsPage() {
  return <main><div className="eyebrow">API documentation</div><h1>Wallet audit API</h1>
    <p>Send a JSON request to the paid endpoint. Unpaid API requests receive an x402 challenge. The service supports wallet audits and transaction preflight on Base, Ethereum, Arbitrum One, and Optimism.</p>
    <section className="card"><h2>Browser payment</h2><p><a href="/demo">Paste an address and open the browser paywall →</a></p></section>
    <section className="card"><h2>Request</h2><pre>{`POST /api/wallet/audit
Content-Type: application/json

{"address":"0x...","chain":"base","intent":"pre-transaction","transaction":{"to":"0x...","value":"0","data":"0x..."}}`}</pre></section>
    <section className="card"><h2>Execution decisions</h2><p><code>proceed</code> means no blocking signal was found. <code>caution</code> means confirmation is required, often because simulation or intelligence is unavailable. <code>block</code> means the transaction cannot pay its value/gas or contains a strong risk signal.</p></section>
    <section className="card"><h2>Supported audit chains</h2><p>Base (<code>eip155:8453</code>), Ethereum (<code>eip155:1</code>), Arbitrum One (<code>eip155:42161</code>), and Optimism (<code>eip155:10</code>).</p></section>
    <section className="card"><h2>Payment options</h2><p>SeedHape 0.4 provides the native paywall and official browser UI for EVM and Solana. Base EIP-3009 is always available. Solana is advertised when <code>SOLANA_MERCHANT_WALLET</code> and <code>SOLANA_FEE_PAYER</code> are configured. The browser paywall then renders both EVM and Solana payment handlers.</p></section>
    <section className="card"><h2>Intents</h2><p><code>counterparty</code>, <code>self-audit</code>, <code>pre-transaction</code>, or <code>portfolio</code>.</p></section>
  </main>;
}
