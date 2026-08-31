import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@coinbase/cdp-sdk", "@seedhape/x402-merchant-sdk", "@x402/paywall"],
};

export default nextConfig;
