import type { Metadata, Viewport } from "next";
import { Cormorant_Infant, Pinyon_Script, Nunito_Sans } from "next/font/google";
import { wedding, getOgImageUrl, getPrimaryEvent, getSiteUrl } from "@/config/wedding";
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

const siteUrl = getSiteUrl();
const primary = getPrimaryEvent();
const ogTitle = wedding.meta.title;
const ogDescription = `${wedding.meta.description} · ${primary.dateLabel}`;
const ogImage = getOgImageUrl();

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
  // Default OG; page.tsx generateMetadata overrides for ?c= / ?to= / ?side=
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: ogTitle,
    title: ogTitle,
    description: ogDescription,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: ogTitle,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: ogTitle,
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: wedding.couple.displayNames,
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
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
    { media: "(prefers-color-scheme: light)", color: "#1b6554" },
    { media: "(prefers-color-scheme: dark)", color: "#0f3d34" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: `Pernikahan ${wedding.couple.groom.fullName} & ${wedding.couple.bride.fullName}`,
  description: wedding.meta.description,
  startDate: "2026-10-10T07:00:00+07:00",
  endDate: "2026-10-10T21:00:00+07:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: primary.venue,
    address: {
      "@type": "PostalAddress",
      streetAddress: primary.address,
      addressLocality: "Mojokerto",
      addressRegion: "Jawa Timur",
      addressCountry: "ID",
    },
  },
  organizer: {
    "@type": "Person",
    name: wedding.couple.displayNames,
    url: siteUrl,
  },
  image: [ogImage],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${script.variable} ${body.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-cream font-sans text-ink">{children}</body>
    </html>
  );
}
