import type { Metadata } from "next";
import { InvitationApp } from "@/components/invitation/InvitationApp";
import { wedding, getPrimaryEvent, getSiteUrl } from "@/config/wedding";
import { findGuestByCode } from "@/lib/guests";
import { decodeGuestName, parseInviteSide, sideLabel } from "@/lib/utils";
import { normalizeGuestCode } from "@/lib/guest-code";

type PageProps = {
  searchParams: Promise<{
    c?: string | string[];
    to?: string | string[];
    side?: string | string[];
  }>;
};

function pick(raw: string | string[] | undefined): string | undefined {
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const code = normalizeGuestCode(pick(params.c));
  const guest = code ? await findGuestByCode(code) : null;
  const directRaw = (pick(params.to) ?? "").trim();
  const directName = directRaw ? decodeGuestName(directRaw) : "";
  const guestName =
    guest?.name ??
    (directName && directName !== "Tamu Undangan" ? directName : null);

  const side = guest?.side ?? parseInviteSide(pick(params.side));
  const primary = getPrimaryEvent(side);
  const siteUrl = getSiteUrl();
  const sideText = sideLabel(side);

  const title = guestName
    ? `Undangan untuk ${guestName} · ${wedding.couple.displayNames}`
    : `${wedding.meta.title} · ${sideText}`;

  const description = guestName
    ? `Kepada Yth. ${guestName}. ${sideText} — ${primary.dateLabel}. ${wedding.meta.description}`
    : `${sideText} — ${primary.dateLabel}. ${wedding.meta.description}`;

  const pageUrl = guest
    ? `${siteUrl}/?c=${guest.code}`
    : guestName
      ? `${siteUrl}/?side=${side}&to=${encodeURIComponent(guestName)}`
      : `${siteUrl}/?side=${side}`;

  const ogQ = new URLSearchParams();
  if (guest) {
    ogQ.set("c", guest.code);
  } else if (guestName) {
    ogQ.set("to", guestName);
    ogQ.set("side", side);
  } else {
    ogQ.set("side", side);
  }
  const imageUrl = `${siteUrl}/api/og?${ogQ.toString()}`;

  return {
    title: { absolute: title },
    description,
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: pageUrl,
      siteName: wedding.meta.title,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default function Home() {
  return <InvitationApp />;
}
