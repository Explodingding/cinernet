import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cinernet — Lommel LV Topology',
  description: 'Industrial Electrical Troubleshooting Dashboard — Lommel Glass Factory',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full dark`}
    >
      <body className="h-full overflow-hidden bg-[#0a0f1a] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
