import { AuditForm } from "../components/AuditForm";

export default function Home() {
  return <main>
    <div className="eyebrow">Wallet Execution Guard · x402</div>
    <h1>Know what an agent is about to execute.</h1>
    <p>Preflight a wallet or transaction across major EVM chains. Get an actionable proceed, caution, or block recommendation with the evidence and limitations behind it.</p>
    <div className="actions"><a className="button secondary" href="/docs">Read the API docs →</a></div>
    <AuditForm />
    <div className="grid">
      <section className="card"><h2>One paid endpoint</h2><p><code>POST /api/wallet/audit</code><br />0.05 USDC per report.</p></section>
      <section className="card"><h2>Machine-readable</h2><p>Stable decisions, findings, evidence, and explicit limitations for automated callers.</p></section>
      <section className="card"><h2>Multi-chain</h2><p>Base, Ethereum, Arbitrum, and Optimism with chain-aware tokens, RPC reads, and explorer evidence.</p></section>
    </div>
  </main>;
}
