import type { AuditReport, WalletSignals } from "./types";

export function buildReport(signals: WalletSignals): AuditReport {
  const score = Math.min(100, signals.findings.reduce((total, finding) => total + (finding.severity === "high" ? 45 : finding.severity === "medium" ? 20 : 5), 0));
  const executionBlocked = signals.execution && (signals.execution.canPayGas === false || signals.execution.canPayValue === false);
  const decision = executionBlocked || score >= 60 ? "block" : score >= 20 || signals.execution?.simulationStatus === "not_run" ? "caution" : "proceed";
  const level = score >= 60 ? "high" : score >= 20 ? "medium" : "low";
  const recommendedAction = decision === "block" ? "block_transaction" : decision === "caution" ? "request_human_confirmation" : "proceed";
  return { address: signals.address, network: signals.chain.caip2, chain: { key: signals.chain.key, name: signals.chain.name, chainId: signals.chain.chainId, explorerUrl: signals.chain.explorerUrl }, observedAt: new Date().toISOString(), walletType: signals.walletType,
    decision, risk: { score, level, confidence: "medium" }, recommendedAction,
    summary: signals.execution ? `${decision === "block" ? "Transaction should not be executed" : decision === "caution" ? "Transaction requires review" : "Transaction appears executable"} on ${signals.chain.name}.` : signals.findings.length ? `Found ${signals.findings.length} observable signal(s) requiring review.` : "No material wallet signals were found in the selected chain checks.",
    balances: { ethWei: signals.ethWei, usdcBaseUnits: signals.usdcBaseUnits }, activity: { transactionCount: signals.transactionCount, recentTransfers: signals.transfers.length, recentApprovals: signals.approvals.length }, execution: signals.execution, approvals: signals.approvals, transfers: signals.transfers, labels: signals.labels, sanctions: signals.sanctions, findings: signals.findings, limitations: signals.limitations };
}
