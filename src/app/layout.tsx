import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OW Admin",
    template: "%s — OW Admin",
  },
  description: "Panel admin Omnaworks : comptes, thèmes, statistiques et sites.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#050510",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-canvas font-sans text-ink">
        <div className="atmosphere pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
        <div className="relative z-10 min-h-full">{children}</div>
      </body>
    </html>
  );
}
