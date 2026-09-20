import type { Metadata } from "next";
import { InvitationApp } from "@/components/invitation/InvitationApp";
import {
  wedding,
  getOgImageUrl,
  getShareMeta,
  getSiteUrl,
} from "@/config/wedding";
import { findGuestByCode } from "@/lib/guests";
import { decodeGuestName, parseInviteSide } from "@/lib/utils";
import { normalizeGuestCode } from "@/lib/guest-code";
import { resolveInvitationGuest } from "@/lib/resolve-guest";

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
  const siteUrl = getSiteUrl();
  const { title, description } = getShareMeta({ side, guestName });

  const pageUrl = guest
    ? `${siteUrl}/?c=${guest.code}`
    : guestName
      ? `${siteUrl}/?side=${side}&to=${encodeURIComponent(guestName)}`
      : `${siteUrl}/?side=${side}`;

  const imageUrl = getOgImageUrl(side);

  return {
    title: { absolute: title },
    description,
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: pageUrl,
      siteName: wedding.couple.displayNames,
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

export default async function Home({ searchParams }: PageProps) {
  const initialGuest = await resolveInvitationGuest(await searchParams);
  return <InvitationApp initialGuest={initialGuest} />;
}
