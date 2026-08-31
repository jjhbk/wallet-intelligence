import { AuditForm } from "../../components/AuditForm";

export default function DemoPage() {
  return <main>
    <div className="eyebrow">Manual browser audit</div>
    <h1>Audit a Base wallet.</h1>
    <p>Paste an address below. You’ll be taken to the x402 wallet payment UI, then returned to the audit report after payment.</p>
    <AuditForm />
  </main>;
}
