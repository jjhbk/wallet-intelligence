import { AuditForm } from "../../components/AuditForm";

export default function DemoPage() {
  return <main>
    <header className="site-header compact">
      <a className="brand" href="/" aria-label="WalletGuard home"><img src="/icon.svg" alt="" /><span>WalletGuard</span></a>
      <nav><a href="/docs">API</a></nav>
    </header>
    <section className="narrow">
      <div className="eyebrow">Manual execution preflight</div>
      <h1>Review a wallet or transaction.</h1>
      <p>Choose a chain and intent, then paste an address. For a pre-transaction check, add the recipient and calldata so the report can explain what execution would do.</p>
      <AuditForm />
    </section>
  </main>;
}
