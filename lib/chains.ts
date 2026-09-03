export interface TokenConfig { address: string; symbol: string; decimals: number; }
export interface ChainConfig { key: string; chainId: number; caip2: string; name: string; rpcUrl: string; nativeCurrency: string; explorerUrl: string; stablecoins: TokenConfig[]; }

const chains: Record<string, ChainConfig> = {
  base: { key: "base", chainId: 8453, caip2: "eip155:8453", name: "Base", rpcUrl: process.env.BASE_RPC_URL || "https://mainnet.base.org", nativeCurrency: "ETH", explorerUrl: "https://basescan.org", stablecoins: [{ address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", symbol: "USDC", decimals: 6 }] },
  ethereum: { key: "ethereum", chainId: 1, caip2: "eip155:1", name: "Ethereum", rpcUrl: process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com", nativeCurrency: "ETH", explorerUrl: "https://etherscan.io", stablecoins: [{ address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC", decimals: 6 }] },
  arbitrum: { key: "arbitrum", chainId: 42161, caip2: "eip155:42161", name: "Arbitrum One", rpcUrl: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc", nativeCurrency: "ETH", explorerUrl: "https://arbiscan.io", stablecoins: [{ address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC", decimals: 6 }] },
  optimism: { key: "optimism", chainId: 10, caip2: "eip155:10", name: "Optimism", rpcUrl: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io", nativeCurrency: "ETH", explorerUrl: "https://optimistic.etherscan.io", stablecoins: [{ address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85", symbol: "USDC", decimals: 6 }] },
};
export const supportedChains = Object.values(chains);
export function getChain(key?: string) { return chains[key || "base"] || chains.base; }
