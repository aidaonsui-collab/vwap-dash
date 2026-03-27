import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VWAP Dashboard',
  description: 'BTC/USD VWAP + RSI signals for Hyperliquid perps',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
