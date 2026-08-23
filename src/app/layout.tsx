import type { Metadata, Viewport } from "next";
import { Cormorant_Infant, Pinyon_Script, Nunito_Sans } from "next/font/google";
import { wedding, getPrimaryEvent } from "@/config/wedding";
import "./globals.css";

const display = Cormorant_Infant({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const script = Pinyon_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const body = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = wedding.meta.siteUrl.replace(/\/$/, "");
const primary = getPrimaryEvent();
const ogTitle = wedding.meta.title;
const ogDescription = `${wedding.meta.description} · ${primary.dateLabel}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: ogTitle,
  description: ogDescription,
  applicationName: ogTitle,
  authors: [{ name: wedding.couple.displayNames }],
  creator: wedding.couple.displayNames,
  keywords: [
    "undangan digital",
    "undangan pernikahan",
    wedding.couple.displayNames,
    wedding.couple.groom.fullName,
    wedding.couple.bride.fullName,
    primary.dateLabel,
    "wedding invitation",
  ],
  alternates: {
    canonical: "/",
  },
  // Default OG; page.tsx generateMetadata overrides when ?to= guest is present
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: ogTitle,
    title: ogTitle,
    description: ogDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f6d4c" },
    { media: "(prefers-color-scheme: dark)", color: "#2e3f2c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${display.variable} ${script.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream font-sans text-ink">{children}</body>
    </html>
  );
}
