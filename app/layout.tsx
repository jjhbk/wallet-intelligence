import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WalletGuard",
  description: "Evidence-backed wallet execution reports for agents and payment systems.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
