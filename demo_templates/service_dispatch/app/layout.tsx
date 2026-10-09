import type { Metadata } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { demoConfig } from "@/config/demo.config";
import { generateTheme } from "@/lib/theme";
import { verticalPacks } from "@/config/verticals";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const pack = verticalPacks[demoConfig.vertical];

export const metadata: Metadata = {
  title: `${demoConfig.company.name} · ${pack.productTagline}`,
  description: `Custom ${pack.tradeNoun} dispatch platform for ${demoConfig.company.name}`,
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeVars = generateTheme(demoConfig.company.primaryColor);
  const styleVars = Object.entries(themeVars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body className="grain min-h-screen antialiased">
        <style>{`:root{${styleVars}}`}</style>
        {children}
      </body>
    </html>
  );
}
