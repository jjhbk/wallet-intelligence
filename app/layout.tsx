import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Base Wallet Decision Report",
  description: "Evidence-backed Base wallet audits for agents and payment systems.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
