import { AuditForm } from "../components/AuditForm";

export default function Home() {
  return <main>
    <div className="eyebrow">Base · x402 · agent safety</div>
    <h1>Know what a wallet is about to do.</h1>
    <p>Base Wallet Decision Report gives agents an evidence-backed preflight before they send funds, accept a counterparty, or interact with a contract.</p>
    <div className="actions"><a className="button secondary" href="/docs">Read the API docs →</a></div>
    <AuditForm />
    <div className="grid">
      <section className="card"><h2>One paid endpoint</h2><p><code>POST /api/wallet/audit</code><br />0.05 USDC per report.</p></section>
      <section className="card"><h2>Machine-readable</h2><p>Stable decisions, findings, evidence, and explicit limitations for automated callers.</p></section>
      <section className="card"><h2>Base mainnet</h2><p>Observable chain facts only. No claims about identity, sanctions, or absolute safety.</p></section>
    </div>
  </main>;
}
