export const intents = ["counterparty", "self-audit", "pre-transaction", "portfolio"] as const;
export type AuditIntent = (typeof intents)[number];
export type Decision = "proceed" | "caution" | "block" | "unknown";

export interface TransactionInput { to: string; value?: string; data?: string; gasLimit?: string; }
export interface AuditRequest { address: string; intent: AuditIntent; chain?: string; transaction?: TransactionInput; }
export interface Finding { id: string; severity: "low" | "medium" | "high"; title: string; description: string; evidence: Record<string, unknown>; }
export interface WalletSignals {
  address: string; chain: import("../chains").ChainConfig; walletType: "eoa" | "contract"; ethWei: string; transactionCount: number;
  execution?: ExecutionAnalysis;
  codeHex: string; usdcBaseUnits: string; approvals: Approval[]; transfers: Transfer[]; labels: Label[]; sanctions: SanctionsStatus; findings: Finding[]; limitations: string[];
}
export interface ExecutionAnalysis { canPayGas: boolean | "unknown"; canPayValue: boolean | "unknown"; simulationStatus: "not_run" | "passed" | "reverted"; decodedCall?: { method: string; token?: string; spender?: string; amount?: string }; }
export interface Approval { token: string; tokenLabel: string; owner: string; spender: string; amount: string; blockNumber: number; }
export interface Transfer { token: string; tokenLabel: string; from: string; to: string; amount: string; blockNumber: number; transactionHash: string; }
export interface Label { address: string; label: string; source: string; }
export interface SanctionsStatus { checked: boolean; status: "clear" | "match" | "unavailable"; source?: string; }
export interface AuditReport {
  address: string; network: string; chain: { key: string; name: string; chainId: number; explorerUrl: string }; observedAt: string; walletType: WalletSignals["walletType"];
  decision: Decision; risk: { score: number; level: "low" | "medium" | "high" | "unknown"; confidence: "low" | "medium" };
  recommendedAction: "proceed" | "request_human_confirmation" | "block_transaction" | "retry_later";
  summary: string; balances: { ethWei: string; usdcBaseUnits: string }; activity: { transactionCount: number; recentTransfers: number; recentApprovals: number };
  execution?: ExecutionAnalysis;
  approvals: Approval[]; transfers: Transfer[]; labels: Label[]; sanctions: SanctionsStatus; findings: Finding[]; limitations: string[];
}
