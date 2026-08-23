import type { Metadata } from "next";
import { InvitationApp } from "@/components/invitation/InvitationApp";
import { wedding, getPrimaryEvent } from "@/config/wedding";
import { findGuestByCode } from "@/lib/guests";
import { parseInviteSide, sideLabel } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{
    c?: string | string[];
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
  const code = (pick(params.c) ?? "").trim();
  const guest = /^\d{4}$/.test(code) ? await findGuestByCode(code) : null;

  const side = guest?.side ?? parseInviteSide(pick(params.side));
  const primary = getPrimaryEvent(side);
  const siteUrl = wedding.meta.siteUrl.replace(/\/$/, "");
  const sideText = sideLabel(side);

  const title = guest
    ? `Undangan untuk ${guest.name} · ${wedding.couple.displayNames}`
    : `${wedding.meta.title} · ${sideText}`;

  const description = guest
    ? `Kepada Yth. ${guest.name}. ${sideText} — ${primary.dateLabel}. ${wedding.meta.description}`
    : `${sideText} — ${primary.dateLabel}. ${wedding.meta.description}`;

  const pageUrl = guest
    ? `${siteUrl}/?c=${guest.code}`
    : `${siteUrl}/?side=${side}`;

  const ogQ = new URLSearchParams();
  if (guest) {
    ogQ.set("c", guest.code);
  } else {
    ogQ.set("side", side);
  }
  const imageUrl = `/api/og?${ogQ.toString()}`;

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
