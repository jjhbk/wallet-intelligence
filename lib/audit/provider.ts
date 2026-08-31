import type { WalletSignals } from "./types";

const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";

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
  const [codeHex, balanceHex, transactionCountHex] = await Promise.all([
    rpc<string>("eth_getCode", [address, "latest"]),
    rpc<string>("eth_getBalance", [address, "latest"]),
    rpc<string>("eth_getTransactionCount", [address, "latest"]),
  ]);
  const walletType = codeHex === "0x" ? "eoa" : "contract";
  const findings = [] as WalletSignals["findings"];
  const transactionCount = Number.parseInt(transactionCountHex, 16);
  if (walletType === "contract") findings.push({ id: "contract-wallet", severity: "low", title: "Contract wallet detected", description: "The address contains deployed bytecode; transaction behavior may be governed by contract logic.", evidence: { codePrefix: codeHex.slice(0, 18) } });
  if (transactionCount === 0) findings.push({ id: "new-wallet", severity: "medium", title: "No outgoing transactions observed", description: "This address has no outgoing transaction count according to the current Base RPC state.", evidence: { transactionCount } });
  if (balanceHex === "0x0") findings.push({ id: "no-eth", severity: "medium", title: "No ETH balance", description: "The address currently has no native ETH balance for Base transaction fees.", evidence: { ethWei: "0" } });
  return { address, walletType, ethWei: BigInt(balanceHex).toString(), transactionCount, codeHex, findings,
    limitations: ["MVP reads current Base RPC state only.", "Token approvals, transfer history, labels, and sanctions data are not included yet."] };
}
