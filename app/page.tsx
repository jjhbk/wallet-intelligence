import { AuditForm } from "../components/AuditForm";

export default function Home() {
  return <main>
    <header className="site-header">
      <a className="brand" href="/" aria-label="WalletGuard home">
        <img src="/icon.svg" alt="" />
        <span>WalletGuard</span>
      </a>
      <nav>
        <a href="/demo">Demo</a>
        <a href="/docs">API</a>
      </nav>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">x402 wallet intelligence</div>
        <h1>Know whether a wallet action is safe to run.</h1>
        <p>WalletGuard turns address and transaction signals into a clear proceed, caution, or block decision for agents, marketplaces, and payment flows.</p>
        <div className="actions">
          <a className="button" href="#audit">Run an audit</a>
          <a className="button secondary" href="/docs">View API docs</a>
        </div>
        <div className="proof-strip">
          <span>Base payments</span>
          <span>4 EVM chains</span>
          <span>Machine-readable reports</span>
        </div>
      </div>
      <div id="audit" className="hero-panel">
        <AuditForm />
      </div>
    </section>

    <section className="insight-band" aria-label="Report summary preview">
      <div>
        <span className="status-pill caution">Caution</span>
        <h2>Built for decisions, not dashboards.</h2>
      </div>
      <p>Each report returns normalized findings, evidence links, balance context, and explicit limitations so automated callers can act without scraping prose.</p>
    </section>

    <section className="grid">
      <article className="card"><span>01</span><h2>Paid endpoint</h2><p><code>POST /api/wallet/audit</code> returns one report for 0.05 USDC with x402 discovery metadata.</p></article>
      <article className="card"><span>02</span><h2>Execution preflight</h2><p>Check wallet balance, recipient, calldata, and risk findings before an agent submits a transaction.</p></article>
      <article className="card"><span>03</span><h2>Marketplace ready</h2><p>Includes Bazaar-compatible icon metadata, schema details, tags, and stable output structure for indexers.</p></article>
    </section>
  </main>;
}
