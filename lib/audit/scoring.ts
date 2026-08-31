import type { AuditReport, WalletSignals } from "./types";

export function buildReport(signals: WalletSignals): AuditReport {
  const score = Math.min(100, signals.findings.reduce((total, finding) => total + (finding.severity === "high" ? 45 : finding.severity === "medium" ? 25 : 10), 0));
  const decision = score >= 60 ? "block" : score >= 20 ? "caution" : "proceed";
  const level = score >= 60 ? "high" : score >= 20 ? "medium" : "low";
  const recommendedAction = decision === "block" ? "block_transaction" : decision === "caution" ? "request_human_confirmation" : "proceed";
  return { address: signals.address, network: "eip155:8453", observedAt: new Date().toISOString(), walletType: signals.walletType,
    decision, risk: { score, level, confidence: "medium" }, recommendedAction,
    summary: signals.findings.length ? `Found ${signals.findings.length} observable signal(s) requiring review.` : "No material signals were found in the MVP checks.",
    balances: { ethWei: signals.ethWei }, activity: { transactionCount: signals.transactionCount }, findings: signals.findings, limitations: signals.limitations };
}
