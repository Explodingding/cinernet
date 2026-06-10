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
  title: 'Cinernet α — Lommel Power Flow Tree',
  description: 'Industrial electrical troubleshooting — 26 kV HV substation to LV tree view (alpha)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full dark`}
    >
      <body className="h-full overflow-hidden bg-[#0a0f1a] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
