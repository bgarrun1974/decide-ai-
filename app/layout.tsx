import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Decide.AI - Decision Engine for Expensive Purchases",
  description: "Make expensive decisions fast — and confidently.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
