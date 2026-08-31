export default function DocsPage() {
  return <main><div className="eyebrow">API documentation</div><h1>Wallet audit API</h1>
    <p>Send a JSON request to the paid endpoint. Unpaid API requests receive an x402 challenge. For manual browser payment, open the GET form below with an address and intent.</p>
    <section className="card"><h2>Browser payment</h2><p><a href="/demo">Paste an address and open the browser paywall →</a></p></section>
    <section className="card"><h2>Request</h2><pre>{`POST /api/wallet/audit
Content-Type: application/json

{"address":"0x...","intent":"counterparty"}`}</pre></section>
    <section className="card"><h2>Intents</h2><p><code>counterparty</code>, <code>self-audit</code>, <code>pre-transaction</code>, or <code>portfolio</code>.</p></section>
  </main>;
}
