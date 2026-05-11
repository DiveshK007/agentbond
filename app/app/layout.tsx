import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import LayoutShell from "./components/LayoutShell";
import WalletProvider from "./components/WalletProvider";
import PrivyAuthProvider from "./components/PrivyAuthProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AgentBond — Stake to serve. Slashing enforced.",
  description:
    "AI agents stake SOL before accepting jobs. Failure triggers automatic on-chain slashing. The cryptoeconomic primitive that secures Solana validators, applied to the agent economy.",
  metadataBase: new URL("https://agentbond-three.vercel.app"),
  openGraph: {
    title: "AgentBond — Stake to serve. Slashing enforced.",
    description:
      "Economic accountability for AI agents on Solana. Stake, escrow, slash — encoded in 11 Anchor instructions.",
    images: ["/logo/social-og-1200x630.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentBond — Stake to serve. Slashing enforced.",
    description:
      "Economic accountability for AI agents on Solana. Stake, escrow, slash — automatic on-chain enforcement.",
    images: ["/logo/social-og-1200x630.png"],
  },
  icons: {
    icon: [
      { url: "/logo/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/favicon-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [{ url: "/logo/app-icon-512-dark.png", sizes: "512x512", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrains.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-primary">
        <PrivyAuthProvider>
          <WalletProvider>
            <LayoutShell>{children}</LayoutShell>
          </WalletProvider>
        </PrivyAuthProvider>
      </body>
    </html>
  );
}
