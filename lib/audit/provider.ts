import type { WalletSignals } from "./types";

const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a9df523b3ef";
const APPROVAL_TOPIC = "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(rpcUrl, { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }), cache: "no-store" });
  if (!response.ok) throw new Error(`Base RPC returned ${response.status}`);
  const payload = await response.json() as { result?: T; error?: { message: string } };
  if (payload.error) throw new Error(payload.error.message);
  if (payload.result === undefined) throw new Error("Base RPC returned no result");
  return payload.result;
}

export async function inspectWallet(address: string): Promise<WalletSignals> {
  const [codeHex, balanceHex, transactionCountHex, usdcBaseUnits, latestHex] = await Promise.all([
    rpc<string>("eth_getCode", [address, "latest"]),
    rpc<string>("eth_getBalance", [address, "latest"]),
    rpc<string>("eth_getTransactionCount", [address, "latest"]),
    rpc<string>("eth_call", [{ to: USDC, data: `0x70a08231000000000000000000000000${address.slice(2)}` }, "latest"]),
    rpc<string>("eth_blockNumber", []),
  ]);
  const walletType = codeHex === "0x" ? "eoa" : "contract";
  const findings = [] as WalletSignals["findings"];
  const transactionCount = Number.parseInt(transactionCountHex, 16);
  const latest = Number.parseInt(latestHex, 16);
  const fromBlock = `0x${Math.max(0, latest - 100_000).toString(16)}`;
  let approvals: WalletSignals["approvals"] = [];
  let transfers: WalletSignals["transfers"] = [];
  const limitations = ["History is limited to the most recent 100,000 Base blocks."];
  try {
    const [approvalLogs, incomingLogs, outgoingLogs] = await Promise.all([
      rpc<Array<{ topics: string[]; data: string; blockNumber: string }>>("eth_getLogs", [{ address: USDC, fromBlock, toBlock: "latest", topics: [APPROVAL_TOPIC, `0x${address.slice(2).padStart(64, "0")}`] }]),
      rpc<Array<{ topics: string[]; data: string; blockNumber: string; transactionHash: string }>>("eth_getLogs", [{ address: USDC, fromBlock, toBlock: "latest", topics: [TRANSFER_TOPIC, null, `0x${address.slice(2).padStart(64, "0")}`] }]),
      rpc<Array<{ topics: string[]; data: string; blockNumber: string; transactionHash: string }>>("eth_getLogs", [{ address: USDC, fromBlock, toBlock: "latest", topics: [TRANSFER_TOPIC, `0x${address.slice(2).padStart(64, "0")}`] }]),
    ]);
    approvals = approvalLogs.map((log) => ({ token: USDC, tokenLabel: "USD Coin (USDC)", owner: address, spender: `0x${log.topics[2].slice(-40)}`, amount: BigInt(log.data).toString(), blockNumber: Number.parseInt(log.blockNumber, 16) }));
    transfers = [...incomingLogs, ...outgoingLogs].map((log) => ({ token: USDC, tokenLabel: "USD Coin (USDC)", from: `0x${log.topics[1].slice(-40)}`, to: `0x${log.topics[2].slice(-40)}`, amount: BigInt(log.data).toString(), blockNumber: Number.parseInt(log.blockNumber, 16), transactionHash: log.transactionHash }));
  } catch { limitations.push("Approval and transfer history could not be read from the configured RPC provider."); }
  if (walletType === "contract") findings.push({ id: "contract-wallet", severity: "low", title: "Contract wallet detected", description: "The address contains deployed bytecode; transaction behavior may be governed by contract logic.", evidence: { codePrefix: codeHex.slice(0, 18) } });
  if (transactionCount === 0) findings.push({ id: "new-wallet", severity: "medium", title: "No outgoing transactions observed", description: "This address has no outgoing transaction count according to the current Base RPC state.", evidence: { transactionCount } });
  if (balanceHex === "0x0") findings.push({ id: "no-eth", severity: "medium", title: "No ETH balance", description: "The address currently has no native ETH balance for Base transaction fees.", evidence: { ethWei: "0" } });
  const labels = [{ address: USDC, label: "USD Coin (USDC)", source: "Base token registry" }];
  let sanctions: WalletSignals["sanctions"] = { checked: false, status: "unavailable" };
  const intelligenceUrl = process.env.WALLET_INTELLIGENCE_URL;
  if (intelligenceUrl) {
    try {
      const response = await fetch(`${intelligenceUrl.replace(/\/$/, "")}/address/${address}`, { headers: process.env.WALLET_INTELLIGENCE_API_KEY ? { authorization: `Bearer ${process.env.WALLET_INTELLIGENCE_API_KEY}` } : undefined, cache: "no-store" });
      if (response.ok) {
        const result = await response.json() as { label?: string; sanctions?: "clear" | "match" | "unavailable" };
        if (result.label) labels.push({ address, label: result.label, source: "configured wallet intelligence provider" });
        sanctions = { checked: true, status: result.sanctions || "unavailable", source: "configured wallet intelligence provider" };
      }
    } catch { limitations.push("The configured wallet intelligence provider was unavailable."); }
  } else limitations.push("Address labels are limited to the built-in Base token registry.", "Sanctions screening requires WALLET_INTELLIGENCE_URL and is not inferred from chain data.");
  if (approvals.some((approval) => approval.amount.length > 30)) findings.push({ id: "large-usdc-approval", severity: "high", title: "Large USDC approval detected", description: "The wallet has granted a very large USDC allowance to a spender.", evidence: { count: approvals.length } });
  return { address, walletType, ethWei: BigInt(balanceHex).toString(), usdcBaseUnits: BigInt(usdcBaseUnits).toString(), transactionCount, codeHex, approvals, transfers, labels, sanctions, findings, limitations };
}
