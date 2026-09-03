import type { ExecutionAnalysis, TransactionInput, WalletSignals } from "./types";
import { getChain } from "../chains";

async function rpc<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }), cache: "no-store" });
  if (!response.ok) throw new Error(`RPC returned ${response.status}`);
  const payload = await response.json() as { result?: T; error?: { message: string } };
  if (payload.error) throw new Error(payload.error.message);
  if (payload.result === undefined) throw new Error("RPC returned no result");
  return payload.result;
}

async function checkSanctions(address: string, chain: string): Promise<WalletSignals["sanctions"]> {
  const url = process.env.WALLET_INTELLIGENCE_URL;
  if (!url) return { checked: false, status: "unavailable" };
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...(process.env.WALLET_INTELLIGENCE_API_KEY ? { authorization: `Bearer ${process.env.WALLET_INTELLIGENCE_API_KEY}` } : {}) }, body: JSON.stringify({ address, chain, checks: ["sanctions"] }), cache: "no-store" });
  if (!response.ok) throw new Error(`Sanctions provider returned ${response.status}`);
  const payload = await response.json() as { status?: string; sanctioned?: boolean; match?: boolean; sanctions?: { status?: string } };
  const status = payload.status ?? payload.sanctions?.status ?? (payload.sanctioned || payload.match ? "match" : "clear");
  if (status !== "clear" && status !== "match") throw new Error("Sanctions provider returned an invalid status");
  return { checked: true, status, source: url };
}

export async function inspectWallet(address: string, chainKey = "base", transaction?: TransactionInput): Promise<WalletSignals> {
  const chain = getChain(chainKey), token = chain.stablecoins[0];
  const [codeHex, balanceHex, transactionCountHex, tokenUnits] = await Promise.all([
    rpc<string>(chain.rpcUrl, "eth_getCode", [address, "latest"]),
    rpc<string>(chain.rpcUrl, "eth_getBalance", [address, "latest"]),
    rpc<string>(chain.rpcUrl, "eth_getTransactionCount", [address, "latest"]),
    rpc<string>(chain.rpcUrl, "eth_call", [{ to: token.address, data: `0x70a08231000000000000000000000000${address.slice(2)}` }, "latest"]),
  ]);
  const walletType = codeHex === "0x" ? "eoa" : "contract";
  const transactionCount = Number.parseInt(transactionCountHex, 16);
  const limitations = [`Approval and transfer history checks are disabled for ${chain.name}.`];
  let approvals: WalletSignals["approvals"] = [];
  let transfers: WalletSignals["transfers"] = [];
  let sanctions: WalletSignals["sanctions"] = { checked: false, status: "unavailable" };
  try { sanctions = await checkSanctions(address, chain.caip2); } catch { limitations.push("Sanctions screening provider could not be reached or returned an invalid response."); }
  const findings: WalletSignals["findings"] = [];
  if (sanctions.status === "match") findings.push({ id: "sanctions-match", severity: "high", title: "Sanctions screening match", description: "The configured sanctions provider returned a match for this address.", evidence: { source: sanctions.source } });
  if (walletType === "contract") findings.push({ id: "contract-wallet", severity: "low", title: "Contract wallet detected", description: "Transaction behavior may be governed by contract logic.", evidence: { codePrefix: codeHex.slice(0, 18) } });
  if (transactionCount === 0) findings.push({ id: "new-wallet", severity: "medium", title: "No outgoing transactions observed", description: "This address has no outgoing transaction count on the selected chain.", evidence: { transactionCount } });
  if (balanceHex === "0x0") findings.push({ id: "no-native-balance", severity: "medium", title: `No ${chain.nativeCurrency} balance`, description: `The wallet may be unable to pay fees on ${chain.name}.`, evidence: { nativeBalance: "0" } });
  if (approvals.some(a => BigInt(a.amount) > (1n << 128n))) findings.push({ id: "large-approval", severity: "high", title: `Large ${token.symbol} approval detected`, description: "The wallet has granted a very large allowance to a spender.", evidence: { token: token.address, count: approvals.length } });
  const execution = transaction ? await analyzeTransaction(chain.rpcUrl, address, transaction, balanceHex) : undefined;
  if (!transaction) limitations.push("No proposed transaction supplied; simulation was not run.");
  if (execution?.decodedCall?.amount && BigInt(execution.decodedCall.amount) > (1n << 128n)) findings.push({ id: "unlimited-approval-request", severity: "high", title: "Unlimited approval requested", description: "This call grants the spender access to all current and future tokens.", evidence: execution.decodedCall });
  return { address, chain, walletType, ethWei: BigInt(balanceHex).toString(), usdcBaseUnits: BigInt(tokenUnits).toString(), transactionCount, codeHex, approvals, transfers, labels: [{ address: token.address, label: `${token.symbol} (${chain.name})`, source: "configured chain token registry" }], sanctions, findings, limitations, execution };
}

async function analyzeTransaction(rpcUrl: string, address: string, tx: TransactionInput, balanceHex: string): Promise<ExecutionAnalysis> {
  const value = BigInt(tx.value || "0"), data = tx.data || "0x";
  const decodedCall = data.startsWith("0x095ea7b3") && data.length >= 138 ? { method: "approve(address,uint256)", token: tx.to, spender: `0x${data.slice(34, 74)}`, amount: BigInt(`0x${data.slice(74, 138)}`).toString() } : undefined;
  try {
    const [gasPriceHex, estimatedGasHex] = await Promise.all([rpc<string>(rpcUrl, "eth_gasPrice", []), rpc<string>(rpcUrl, "eth_estimateGas", [{ from: address, to: tx.to, value: `0x${value.toString(16)}`, data }])]);
    const gasCost = BigInt(estimatedGasHex) * BigInt(gasPriceHex);
    return { canPayGas: BigInt(balanceHex) >= gasCost, canPayValue: BigInt(balanceHex) >= value, simulationStatus: "passed", decodedCall };
  } catch {
    return { canPayGas: "unknown", canPayValue: BigInt(balanceHex) >= value, simulationStatus: "reverted", decodedCall };
  }
}
