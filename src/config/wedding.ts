import type { InviteSide, WeddingConfig } from "@/types/wedding";
import { parseInviteSide } from "@/lib/utils";

/**
 * Single source of truth for the invitation.
 * Edit names, schedule, bank accounts, love story, etc. here.
 */
export const wedding: WeddingConfig = {
  meta: {
    title: "The Wedding of Ubay & Nindi",
    description:
      "Dengan memohon ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan Muhammad Ubaydillah & Nindi Nirmala Nadziroh.",
    /** Canonical public URL — used for Open Graph absolute image/links */
    siteUrl: "https://ubaynindi.vercel.app",
    ogImage: "/opengraph-image",
  },

  couple: {
    order: "groom-first",
    groom: {
      fullName: "Muhammad Ubaydillah",
      nickname: "Ubay",
      parents: "Putra dari Bapak H. M. Khoirin & Ibu Hj. Khusnul Khotimah",
    },
    bride: {
      fullName: "Nindi Nirmala Nadziroh",
      nickname: "Nindi",
      parents: "Putri dari Bapak Edi Santoso & Ibu Suminah",
    },
    displayNames: "Ubay & Nindi",
  },

  /** Default when URL has no ?side= */
  primaryEventId: "wanita",

  /**
   * Dua undangan, satu website — bedakan lewat link:
   * - Wanita: /?side=wanita  (atau tanpa side)
   * - Pria:   /?side=pria
   */
  events: [
    {
      id: "wanita",
      sides: ["wanita"],
      title: "Akad & Resepsi",
      date: "2026-10-10",
      dateLabel: "Sabtu, 10 Oktober 2026",
      time: "07:00 WIB",
      sessions: [
        { label: "Akad Nikah", time: "07:00 WIB" },
        { label: "Resepsi", time: "12:00 WIB – selesai" },
      ],
      venue: "Kediaman Mempelai Wanita",
      address:
        "Dsn. Bakalan RT.02 RW.01, Ds. Mojodadi, Kec. Kemlagi, Kab. Mojokerto",
      lat: -7.3948,
      lng: 112.3745,
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Mojodadi+Kemlagi+Mojokerto",
    },
    {
      id: "pria",
      sides: ["pria"],
      title: "Resepsi",
      date: "2026-10-11",
      dateLabel: "Minggu, 11 Oktober 2026",
      time: "12:00 WIB",
      sessions: [{ label: "Resepsi", time: "12:00 WIB – selesai" }],
      venue: "Kediaman Mempelai Pria",
      address:
        "Dsn. Kedawung Utara RT.01 RW.02, Ds. Bicak, Kec. Trowulan, Kab. Mojokerto",
      lat: -7.48742,
      lng: 112.38653,
      mapsUrl: "https://maps.app.goo.gl/XThzJXHxKaLZCJZB8",
    },
  ],

  verse: {
    text: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
    source: "Q.S. Ar-Rum : 21",
  },

  intro: {
    greeting: "Assalamu’alaikum Warahmatullahi Wabarakatuh",
    body: "Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Ya Allah, semoga ridho-Mu tercurah mengiringi pernikahan kami.",
  },

  loveStory: [
    {
      date: "2023",
      title: "Pertama Bertemu",
      description:
        "Takdir mempertemukan kami dalam sebuah kesempatan yang sederhana, namun penuh makna.",
    },
    {
      date: "2024",
      title: "Saling Mengenal",
      description:
        "Hari demi hari menumbuhkan rasa. Kami belajar memahami, menghargai, dan saling menjaga.",
    },
    {
      date: "2025",
      title: "Melangkah Serius",
      description:
        "Dengan restu kedua keluarga, kami memutuskan untuk melanjutkan hubungan ke jenjang yang lebih sakral.",
    },
    {
      date: "10 Okt 2026",
      title: "Menikah",
      description:
        "InsyaAllah kami mengikat janji suci sebagai suami istri. Mohon doa restu Bapak/Ibu/Saudara/i.",
    },
  ],

  dressCode: {
    enabled: false,
    title: "Dress Code",
    note: "Kami dengan hormat menganjurkan tamu untuk mengenakan nuansa warna berikut di hari istimewa kami.",
    colors: [
      { name: "Sage", hex: "#5f7d5b" },
      { name: "Ivory", hex: "#f3efe6" },
      { name: "Champagne", hex: "#c4a878" },
    ],
  },

  notes: {
    enabled: true,
    items: [
      {
        title: "Doa Restu",
        body: "Kehadiran dan doa Bapak/Ibu/Saudara/i adalah anugerah terindah bagi kami.",
      },
      {
        title: "Parkir",
        body: "Tersedia area parkir di sekitar lokasi. Mohon parkir dengan tertib.",
      },
    ],
  },

  gifts: {
    enabled: true,
    note: "Kehadiran dan doa restu Anda adalah hadiah terindah bagi kami.",
    accounts: [
      {
        bank: "BCA",
        accountNumber: "0000000000",
        accountName: "Muhammad Ubaydillah",
      },
      {
        bank: "BRI",
        accountNumber: "0000000000",
        accountName: "Nindi Nirmala Nadziroh",
      },
    ],
  },

  wishes: {
    enabled: true,
    title: "Ucapan & Doa",
    subtitle: "Berikan doa dan ucapan terbaik untuk kami.",
  },

  closing: {
    body: "Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami.",
    salam: "Wassalamu’alaikum Warahmatullahi Wabarakatuh",
  },

  audio: {
    src: "/music/bgm.mp3",
    autoplayOnOpen: true,
  },

  theme: {
    primary: "#4f6d4c",
    primaryDark: "#2e3f2c",
    cream: "#f7f6f2",
    creamDark: "#eef0eb",
    gold: "#8f7348",
    goldSoft: "#b89a6a",
    ink: "#2a322c",
    muted: "#556058",
  },
};

/** Helpers derived from config — pass InviteSide for pria/wanita variants */

export function getEventsForSide(side: InviteSide = "wanita") {
  const list = wedding.events.filter((e) => e.sides.includes(side));
  return list.length ? list : wedding.events;
}

export function getPrimaryEvent(side: InviteSide = "wanita") {
  const events = getEventsForSide(side);
  return (
    events.find((e) => e.id === side) ??
    events.find((e) => e.id === wedding.primaryEventId) ??
    events[0]
  );
}

export function getCountdownTarget(side: InviteSide = "wanita"): Date {
  const event = getPrimaryEvent(side);
  const [y, m, d] = event.date.split("-").map(Number);
  const timeMatch = event.time.match(/(\d{1,2}):(\d{2})/);
  const hours = timeMatch ? Number(timeMatch[1]) : 0;
  const minutes = timeMatch ? Number(timeMatch[2]) : 0;
  return new Date(y, m - 1, d, hours, minutes, 0, 0);
}

export function getCalendarUrl(side: InviteSide = "wanita"): string {
  const event = getPrimaryEvent(side);
  const [y, m, d] = event.date.split("-").map(Number);
  const timeMatch = event.time.match(/(\d{1,2}):(\d{2})/);
  const hours = timeMatch ? Number(timeMatch[1]) : 8;
  const minutes = timeMatch ? Number(timeMatch[2]) : 0;

  const start = new Date(Date.UTC(y, m - 1, d, hours - 7, minutes, 0));
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const fmt = (dt: Date) =>
    dt
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const { groom, bride, displayNames } = wedding.couple;
  const text = encodeURIComponent(`Pernikahan ${displayNames} — ${event.title}`);
  const details = encodeURIComponent(
    `The Wedding of ${groom.fullName} & ${bride.fullName}\n${event.title}\n${event.venue}\n${event.address}`,
  );
  const location = encodeURIComponent(`${event.venue}, ${event.address}`);

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}&dates=${fmt(start)}%2F${fmt(end)}`;
}

/** Build invite URL — prefer shortcode `c` over public name */
export function getInviteUrl(opts?: {
  code?: string | null;
  side?: InviteSide;
}): string {
  if (typeof window !== "undefined") {
    // Prefer current page URL (already has ?c=)
    if (opts?.code) {
      const url = new URL(window.location.origin + "/");
      url.searchParams.set("c", opts.code);
      return url.toString();
    }
    return window.location.href.split("#")[0];
  }
  const base = wedding.meta.siteUrl.replace(/\/$/, "");
  if (opts?.code) return `${base}/?c=${opts.code}`;
  const side = opts?.side ?? "wanita";
  return `${base}/?side=${side}`;
}

/** WhatsApp share text + link */
export function getWhatsAppShareUrl(opts?: {
  code?: string | null;
  side?: InviteSide;
  guestName?: string;
}): string {
  const side = opts?.side ?? "wanita";
  const url = getInviteUrl({ code: opts?.code, side });
  const primary = getPrimaryEvent(side);
  const toLine =
    opts?.guestName && opts.guestName !== "Tamu Undangan"
      ? `Kepada Yth. *${opts.guestName}*`
      : null;
  const text = [
    `Assalamu’alaikum Warahmatullahi Wabarakatuh`,
    ``,
    toLine,
    `Tanpa mengurangi rasa hormat, kami mengundang untuk menghadiri:`,
    ``,
    `*${wedding.couple.displayNames}*`,
    `*${primary.title}*`,
    primary.dateLabel,
    primary.sessions?.map((s) => `${s.label}: ${s.time}`).join("\n") ??
      primary.time,
    primary.venue,
    ``,
    `Undangan digital:`,
    url,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export { parseInviteSide };
