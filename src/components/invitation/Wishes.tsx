"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { wedding } from "@/config/wedding";
import type { Wish } from "@/types/wedding";
import { Button } from "@/components/ui/Button";
import { InView, SectionHead } from "@/components/motion/primitives";
import { BotanicalBackdrop } from "@/components/ui/Ornament";
import { useInvitationGuest } from "@/hooks/useInvitationGuest";

type GuestbookEntry = Wish & { id: string; createdAt: string };
type Filter = "semua" | "hadir" | "tidak_hadir";

const labels: Record<Wish["attendance"], string> = {
  hadir: "Hadir",
  tidak_hadir: "Tidak Hadir",
  ragu: "Belum Pasti",
};

function createUuid() {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return [...bytes].map((byte, index) => `${byte.toString(16).padStart(2, "0")}${[3, 5, 7, 9].includes(index) ? "-" : ""}`).join("");
  }
  return "00000000-0000-4000-8000-" + `${Date.now()}${Math.random()}`.replace(/\D/g, "").slice(-12).padStart(12, "0");
}

function errorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") return payload.message;
  return fallback;
}

function formatWishTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function WishCard({ wish }: { wish: GuestbookEntry }) {
  const reduceMotion = useReducedMotion();
  const time = formatWishTime(wish.createdAt);
  const attending = wish.attendance === "hadir";

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="px-4 py-4 transition-colors sm:px-5 sm:hover:bg-cream-soft/70"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-primary/10 font-serif text-base font-semibold text-primary-dark" aria-hidden>
          {wish.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="min-w-0 truncate font-serif text-[1.15rem] leading-tight font-semibold text-ink">{wish.name}</p>
            {time ? <time dateTime={wish.createdAt} className="shrink-0 text-[10.5px] text-muted">{time}</time> : null}
          </div>
          <p className={`mt-1 text-[10.5px] font-bold tracking-[0.12em] uppercase ${attending ? "text-primary" : "text-gold-deep"}`}>
            {labels[wish.attendance]}
            {wish.guestCount && attending ? ` · ${wish.guestCount} orang` : ""}
          </p>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-ink">{wish.message}</p>
        </div>
      </div>
    </motion.li>
  );
}

export function Wishes() {
  const guest = useInvitationGuest();
  const sectionRef = useRef<HTMLElement | null>(null);
  const visibleRef = useRef(false);
  const submissionKeyRef = useRef<string | null>(null);
  const formStartedAtRef = useRef<number | null>(null);
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const loadedRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const listScrollRef = useRef<HTMLDivElement | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  const pendingMoreRef = useRef(false);
  const errorCursorRef = useRef<string | null>(null);
  const loadPageRef = useRef<(cursor: string | null) => Promise<void>>(async () => {});
  const [listOverflows, setListOverflows] = useState(false);
  const [scrollBoxReady, setScrollBoxReady] = useState(false);
  const [list, setList] = useState<GuestbookEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [name, setName] = useState(() => guest.resolved && guest.name !== "Tamu Undangan" ? guest.name : "");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [attendance, setAttendance] = useState<Wish["attendance"]>("hadir");
  const [guestCount, setGuestCount] = useState(1);
  const [filter, setFilter] = useState<Filter>("semua");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [sent, setSent] = useState("");
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const loadPage = useCallback(async (cursor: string | null = null) => {
    if (loadingRef.current || loadingMoreRef.current) {
      if (cursor) pendingMoreRef.current = true;
      return;
    }
    const more = cursor !== null;
    if (more) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      loadingRef.current = true;
      setLoading(true);
    }
    let succeeded = false;
    try {
      const query = new URLSearchParams({ limit: "20" });
      if (cursor) query.set("cursor", cursor);
      const response = await fetch(`/api/guestbook?${query.toString()}`, { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(errorMessage(payload, "Ucapan belum dapat dimuat."));
      const entries = Array.isArray(payload?.entries) ? payload.entries as GuestbookEntry[] : [];
      const cursorValue = entries.length > 0 && typeof payload?.nextCursor === "string" ? payload.nextCursor : null;
      if (more) {
        setList((current) => [...current, ...entries.filter((entry) => !current.some((item) => item.id === entry.id))]);
      } else {
        setList(entries);
      }
      nextCursorRef.current = cursorValue;
      setNextCursor(cursorValue);
      if (more || cursor === errorCursorRef.current) {
        errorCursorRef.current = null;
        setLoadError("");
      }
      loadedRef.current = true;
      setLoaded(true);
      succeeded = true;
    } catch (reason) {
      errorCursorRef.current = cursor;
      pendingMoreRef.current = false;
      setLoadError(reason instanceof Error ? reason.message : "Ucapan belum dapat dimuat.");
    } finally {
      loadingRef.current = false;
      loadingMoreRef.current = false;
      setLoading(false);
      setLoadingMore(false);
      if (succeeded && pendingMoreRef.current) {
        pendingMoreRef.current = false;
        const follow = nextCursorRef.current;
        if (follow && follow !== cursor) void loadPageRef.current(follow);
      }
    }
  }, []);

  useEffect(() => {
    loadPageRef.current = loadPage;
  }, [loadPage]);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      visibleRef.current = true;
      const timer = window.setTimeout(() => void loadPage(null), 450);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      visibleRef.current = true;
      if (!loadedRef.current) void loadPage(null);
      observer.disconnect();
    }, { rootMargin: "360px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [loadPage]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      if (visibleRef.current && !document.hidden && !connection?.saveData && loadedRef.current) void loadPage(null);
    }, 45_000);
    return () => window.clearInterval(timer);
  }, [loadPage]);

  useEffect(() => {
    const element = listScrollRef.current;
    if (!element) return;
    const measure = () => {
      setListOverflows(element.scrollHeight > element.clientHeight + 4);
      setScrollBoxReady(element.clientHeight >= 8);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [list.length, filter, loaded, loadingMore]);

  useEffect(() => {
    listScrollRef.current?.scrollTo({ top: 0 });
  }, [filter]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = listScrollRef.current;
    if (!sentinel || !root || !scrollBoxReady || !nextCursor || loadError) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (!visible) {
        pendingMoreRef.current = false;
        return;
      }
      if (loadingMoreRef.current || loadingRef.current) {
        pendingMoreRef.current = true;
        return;
      }
      const cursor = nextCursorRef.current;
      if (cursor) void loadPage(cursor);
    }, { root, rootMargin: "160px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextCursor, loadError, loadPage, list.length, filter, loaded, scrollBoxReady]);

  if (!wedding.wishes.enabled) return null;

  const visibleList = list.filter((wish) => {
    if (filter === "hadir") return wish.attendance === "hadir";
    if (filter === "tidak_hadir") return wish.attendance !== "hadir";
    return true;
  });
  const totalAttending = list.filter((wish) => wish.attendance === "hadir").reduce((sum, wish) => sum + (wish.guestCount ?? 1), 0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSent("");
    setRetryAfter(null);
    const normalizedName = name.normalize("NFC").replace(/\s+/g, " ").trim();
    const normalizedMessage = message.normalize("NFC").replace(/\s+/g, " ").trim();
    if (!anonymous && Array.from(normalizedName).length < 2) return setError("Nama minimal 2 karakter.");
    if (Array.from(normalizedMessage).length < 5) return setError("Ucapan minimal 5 karakter.");
    submissionKeyRef.current ??= createUuid();
    formStartedAtRef.current ??= Date.now();
    setSubmitting(true);
    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": submissionKeyRef.current },
        body: JSON.stringify({ guest_name: normalizedName, anonymous, message: normalizedMessage, attendance, guest_count: attendance === "hadir" ? guestCount : null, side: guest.side, website: "", form_started_at: formStartedAtRef.current }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 429 && typeof payload?.retryAfter === "number") setRetryAfter(payload.retryAfter);
        throw new Error(errorMessage(payload, "Ucapan belum dapat dikirim. Silakan coba lagi."));
      }
      const entry = payload as GuestbookEntry;
      setList((current) => [entry, ...current.filter((item) => item.id !== entry.id)]);
      setSent("Terima kasih — ucapan Anda sudah tampil untuk para tamu undangan.");
      submissionKeyRef.current = null;
      formStartedAtRef.current = null;
      setName(guest.resolved && guest.name !== "Tamu Undangan" ? guest.name : "");
      setAnonymous(false);
      setMessage("");
      setAttendance("hadir");
      setGuestCount(1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Ucapan belum dapat dikirim. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section ref={sectionRef} id="wishes" className="section-sage section-pad relative overflow-hidden px-5 pb-32 sm:px-8" aria-labelledby="wishes-title">
      <BotanicalBackdrop variant="left" />
      <div className="relative mx-auto max-w-[42rem]">
        <SectionHead script="Wishes & RSVP" title={wedding.wishes.title} subtitle={wedding.wishes.subtitle} />

        <InView>
          <div className="surface-card mb-6 flex items-center justify-between gap-3 px-4.5 py-3.5 text-xs text-muted" aria-live="polite">
            <span className="font-bold text-primary-dark">Ucapan dari semua pengunjung</span>
            <span className="rounded-full bg-primary-dark px-3.5 py-1 font-bold text-cream">{totalAttending} hadir terlihat</span>
          </div>

          <form onSubmit={submit} onFocus={() => { formStartedAtRef.current ??= Date.now(); }} className="surface-card mb-7 space-y-4.5 p-5 sm:p-6" aria-busy={submitting}>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2"><label htmlFor="wish-name" className="block text-[11px] font-bold tracking-wide text-primary uppercase">Nama Anda</label>{guest.resolved && guest.name !== "Tamu Undangan" && !anonymous ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-bold text-primary-dark">✓ Otomatis terisi</span> : null}</div>
              <input id="wish-name" value={anonymous ? "Anonim" : name} onChange={(event) => setName(event.target.value)} placeholder="Tulis nama lengkap Anda" disabled={anonymous || submitting} className="field-input min-h-11 w-full rounded-full border border-gold/35 bg-cream px-4 py-2.5 text-sm font-medium text-ink outline-none disabled:cursor-not-allowed disabled:opacity-60" maxLength={80} autoComplete="name" aria-describedby="wish-name-help wish-error" />
              <p id="wish-name-help" className="mt-1.5 text-[11px] text-muted">Nama boleh disamarkan dengan memilih Anonim.</p>
              <label className="mt-2.5 flex min-h-11 cursor-pointer items-center gap-2 select-none"><input type="checkbox" checked={anonymous} onChange={(event) => { setAnonymous(event.target.checked); if (event.target.checked) setError(""); }} disabled={submitting} className="h-4 w-4 rounded border-primary/30 accent-primary-dark" /><span className="text-[12px] text-muted">Kirim sebagai <span className="font-bold text-primary-dark">Anonim</span></span></label>
            </div>

            <div>
              <label htmlFor="wish-msg" className="mb-1.5 block text-[11px] font-bold tracking-wide text-primary uppercase">Ucapan & Doa Restu</label>
              <textarea id="wish-msg" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tuliskan doa & ucapan hangat untuk Ubay & Nindi..." rows={4} className="field-input w-full resize-y rounded-2xl border border-gold/35 bg-cream px-4 py-3 text-sm font-medium text-ink outline-none" maxLength={500} disabled={submitting} aria-describedby="wish-message-help wish-error" />
              <p id="wish-message-help" className="mt-1.5 text-right text-[11px] text-muted">{message.length}/500</p>
            </div>

            <fieldset><legend className="mb-2 text-[11px] font-bold tracking-wide text-primary uppercase">Konfirmasi Kehadiran</legend><div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{(["hadir", "tidak_hadir", "ragu"] as const).map((value) => <button key={value} type="button" onClick={() => setAttendance(value)} disabled={submitting} aria-pressed={attendance === value} className={`min-h-11 rounded-full border px-2 py-2.5 text-[11px] font-bold leading-tight transition-colors ${attendance === value ? "border-primary-dark bg-primary-dark text-cream" : "border-gold/35 bg-cream text-primary-dark hover:border-gold"}`}>{labels[value]}</button>)}</div></fieldset>

            {attendance === "hadir" ? <fieldset><legend className="mb-2 text-[11px] font-bold tracking-wide text-primary uppercase">Jumlah Tamu</legend><div className="grid grid-cols-5 gap-2">{Array.from({ length: 10 }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => setGuestCount(number)} disabled={submitting} aria-pressed={guestCount === number} className={`min-h-11 rounded-full border text-xs font-bold transition-colors ${guestCount === number ? "border-primary-dark bg-primary-dark text-cream" : "border-gold/35 bg-cream text-primary-dark hover:border-gold"}`}>{number}</button>)}</div><p className="mt-1.5 text-[11px] text-muted">Jumlah termasuk Anda.</p></fieldset> : null}

            {error ? <p id="wish-error" role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-800">{error}{retryAfter ? ` Coba lagi dalam sekitar ${retryAfter} detik.` : ""}</p> : null}
            {sent ? <p role="status" aria-live="polite" className="rounded-xl bg-primary/12 px-3 py-2.5 text-center text-xs font-bold text-primary-dark">{sent}</p> : null}
            <Button type="submit" variant="double-solid" className="min-h-11 w-full font-bold shadow-md" disabled={submitting}>{submitting ? "Mengirim…" : "Kirim Ucapan & Doa"}</Button>
            <p className="text-center text-[11px] leading-relaxed text-muted">Ucapan langsung tampil dan dapat dibaca semua pengunjung undangan.</p>
          </form>
        </InView>

        <div className="surface-card overflow-hidden">
          <div className="flex items-end justify-between gap-3 border-b border-gold/25 px-4 py-3.5 sm:px-5">
            <div>
              <p className="font-serif text-[1.45rem] leading-none text-primary-dark">Buku Tamu</p>
              <p className="mt-1.5 text-[11px] text-muted">{loaded ? `${visibleList.length} ${nextCursor ? "ditampilkan" : "ucapan"}` : "Ucapan tamu"}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 border-b border-gold/20 px-3 py-2.5 sm:px-4" role="group" aria-label="Filter ucapan">
            {(["semua", "hadir", "tidak_hadir"] as const).map((value) => (
              <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`min-h-10 flex-1 rounded-full py-1.5 text-[11px] font-bold transition-colors ${filter === value ? "bg-primary-dark text-cream" : "text-muted hover:bg-cream-soft hover:text-primary-dark"}`}>
                {value === "semua" ? "Semua" : value === "hadir" ? "Hadir" : "Absen/Ragu"}
              </button>
            ))}
          </div>

          {listOverflows ? <p className="border-b border-gold/15 py-1.5 text-center text-[10.5px] text-muted">Gulir untuk membaca</p> : null}

          <div
            ref={listScrollRef}
            id="wish-list"
            tabIndex={0}
            aria-label="Daftar ucapan"
            className="scroll-soft min-h-24 max-h-[min(32rem,calc(100dvh-16rem))] overflow-y-auto overscroll-y-contain"
          >
            {loading && !loaded ? <div className="space-y-3 px-4 py-4" aria-label="Memuat ucapan"><div className="h-16 animate-pulse rounded-2xl bg-cream-soft" /><div className="h-16 animate-pulse rounded-2xl bg-cream-soft" /><div className="h-16 animate-pulse rounded-2xl bg-cream-soft" /></div> : null}
            {loadError ? <div className="px-4 py-5 text-center text-sm text-muted" role="alert"><p>{loadError}</p>{!loading && !loadingMore ? <button type="button" onClick={() => void loadPage(errorCursorRef.current)} className="mt-3 min-h-11 rounded-full bg-primary-dark px-4 py-2 text-xs font-bold text-cream">Coba lagi</button> : null}</div> : null}
            {!loading && !loadError && loaded && visibleList.length === 0 && !nextCursor ? <p className="px-4 py-8 text-center text-sm text-muted">{list.length === 0 ? "Belum ada ucapan. Jadilah yang pertama." : "Tidak ada ucapan untuk filter ini."}</p> : null}
            {!loadError && loaded && !loadingMore && visibleList.length === 0 && nextCursor ? <p role="status" className="px-4 py-8 text-center text-sm text-muted">Mencari ucapan yang sesuai…</p> : null}

            {visibleList.length > 0 ? (
              <ul className="divide-y divide-gold/20">
                <AnimatePresence initial={false}>
                  {visibleList.map((wish) => <WishCard key={wish.id} wish={wish} />)}
                </AnimatePresence>
              </ul>
            ) : null}

            <div ref={sentinelRef} className="h-px" aria-hidden />
            {loadingMore ? <p role="status" className="py-4 text-center text-[11px] font-semibold text-muted">Memuat ucapan…</p> : null}
            {loaded && !nextCursor && !loadError && list.length > 0 ? <p className="border-t border-gold/15 py-4 text-center text-[11px] text-muted">Semua ucapan sudah tampil.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
