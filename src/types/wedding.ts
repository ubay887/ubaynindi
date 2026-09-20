/** Invitation variant shared via URL `?side=wanita|pria` */
export type InviteSide = "wanita" | "pria";

export type BankAccount = {
  bank: string;
  accountNumber: string;
  accountName: string;
};

export type EventSession = {
  label: string;
  time: string;
};

export type EventDetail = {
  id: string;
  title: string;
  /** Which invitation link(s) show this event */
  sides: InviteSide[];
  /** Optional small label under title */
  subtitle?: string;
  /** ISO date string, e.g. 2026-10-10 */
  date: string;
  /** Display date in Indonesian, e.g. Sabtu, 10 Oktober 2026 */
  dateLabel: string;
  /** Primary time (used for countdown) */
  time: string;
  /** Optional multi-session schedule (Akad / Resepsi) */
  sessions?: EventSession[];
  venue: string;
  address: string;
  /** Extra note under time/location */
  note?: string;
  /** Google Maps directions / place URL */
  mapsUrl?: string;
  /** Map pin coordinates (WGS84) for Leaflet preview */
  lat?: number;
  lng?: number;
};

export type LoveStoryItem = {
  date: string;
  title: string;
  description: string;
};

export type CouplePerson = {
  fullName: string;
  nickname: string;
  parents: string;
  /** Optional Instagram handle without @ */
  instagram?: string;
};

export type Wish = {
  id: string;
  name: string;
  message: string;
  attendance: "hadir" | "tidak_hadir" | "ragu";
  /** Number of guests (including themselves) */
  guestCount?: number;
  /** Invitation side when the wish was sent */
  side?: InviteSide;
  createdAt: string;
};

export type DressCodeColor = {
  name: string;
  hex: string;
};

export type WeddingConfig = {
  meta: {
    title: string;
    description: string;
    siteUrl: string;
    ogImage?: string;
  };
  couple: {
    order: "groom-first" | "bride-first";
    groom: CouplePerson;
    bride: CouplePerson;
    displayNames: string;
  };
  /** Primary event id used for countdown & calendar (must match an events[].id) */
  primaryEventId: string;
  events: EventDetail[];
  verse: {
    arabic?: string;
    text: string;
    source: string;
  };
  intro: {
    greeting: string;
    body: string;
  };
  loveStory: LoveStoryItem[];
  dressCode: {
    enabled: boolean;
    title: string;
    note: string;
    colors: DressCodeColor[];
  };
  /** Soft notes for guests (parking, timing, etc.) */
  notes: {
    enabled: boolean;
    items: { title: string; body: string }[];
  };
  gifts: {
    enabled: boolean;
    note: string;
    accounts: BankAccount[];
  };
  wishes: {
    enabled: boolean;
    title: string;
    subtitle: string;
  };
  closing: {
    body: string;
    salam: string;
  };
  audio: {
    src: string;
    autoplayOnOpen: boolean;
  };
  theme: {
    primary: string;
    primaryDark: string;
    cream: string;
    creamDark: string;
    gold: string;
    goldSoft: string;
    ink: string;
    muted: string;
  };
};
