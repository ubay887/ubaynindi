"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { GuestInvite } from "@/types/guest";
import type { InviteSide } from "@/types/wedding";
import { getInviteShareText, wedding } from "@/config/wedding";

type GuestRow = GuestInvite & { url: string };

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [name, setName] = useState("");
  const [side, setSide] = useState<InviteSide>("wanita");
  const [manualCode, setManualCode] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState<"semua" | InviteSide>("semua");
  const isDev = process.env.NODE_ENV !== "production";

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  };

  const loadGuests = useCallback(async () => {
    const res = await fetch("/api/admin/guests");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = (await res.json()) as { guests: GuestRow[] };
    setGuests(data.guests ?? []);
    setAuthed(true);
  }, []);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/session");
      const data = (await res.json()) as { authenticated: boolean };
      if (data.authenticated) {
        setAuthed(true);
        await loadGuests();
      } else {
        setAuthed(false);
      }
    })();
  }, [loadGuests]);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setLoginError(data.error || "Gagal login.");
        return;
      }
      setPassword("");
      setAuthed(true);
      await loadGuests();
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setGuests([]);
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          side,
          code: manualCode.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; guest?: GuestRow };
      if (!res.ok) {
        setFormError(data.error || "Gagal membuat undangan.");
        return;
      }
      setName("");
      setManualCode("");
      await loadGuests();
      if (data.guest) {
        await navigator.clipboard?.writeText(data.guest.url).catch(() => null);
        flash(`Kode ${data.guest.code} dibuat · link disalin`);
      }
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (code: string) => {
    if (!window.confirm(`Hapus kode ${code}?`)) return;
    const res = await fetch(`/api/admin/guests?code=${code}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadGuests();
      flash("Dihapus");
    }
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(label);
    } catch {
      flash("Gagal menyalin");
    }
  };

  if (authed === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted">
        Memuat…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-12">
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Admin
          </p>
          <h1 className="mt-1 font-serif text-2xl text-primary-dark">
            Generator Undangan
          </h1>
          <p className="mt-2 text-[13px] text-muted">
            Masuk untuk membuat shortcode undangan tamu (sisi pria/wanita).
          </p>
          <form onSubmit={onLogin} className="mt-6 space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password admin"
              className="field-input w-full rounded-full border border-primary/15 bg-cream px-4 py-2.5 text-sm outline-none"
              autoComplete="current-password"
              required
            />
            {loginError ? (
              <p className="text-xs text-red-700">{loginError}</p>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="btn-double-solid w-full rounded-full py-2.5 text-sm font-medium text-cream disabled:opacity-60"
            >
              Masuk
            </button>
          </form>
          <p className="mt-4 text-[11px] text-muted">
            Set password lewat env{" "}
            <code className="text-primary-dark">ADMIN_PASSWORD</code>.
            {isDev ? (
              <>
                {" "}
                Default lokal:{" "}
                <code className="text-primary-dark">ubay2026</code>
              </>
            ) : null}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Admin
          </p>
          <h1 className="font-serif text-2xl text-primary-dark">
            Generator Link
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {wedding.couple.displayNames} · shortcode 4–8 digit
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onLogout()}
          className="rounded-full border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary-dark"
        >
          Keluar
        </button>
      </header>

      {toast ? (
        <div className="mb-4 rounded-xl bg-primary-dark px-3 py-2 text-center text-xs font-medium text-cream">
          {toast}
        </div>
      ) : null}

      <form
        onSubmit={onCreate}
        className="mb-6 space-y-3 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-[11px] font-medium text-muted">
            Nama tamu
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bapak Andi dan Keluarga"
            className="field-input w-full rounded-full border border-primary/15 bg-cream px-4 py-2.5 text-sm outline-none"
            required
            minLength={2}
            maxLength={80}
          />
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-medium text-muted">Jenis undangan</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["wanita", "Pihak Wanita"],
                ["pria", "Pihak Pria"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setSide(v)}
                className={`rounded-full border py-2 text-xs font-semibold transition ${
                  side === v
                    ? "border-primary-dark bg-primary-dark text-cream"
                    : "border-primary/15 text-primary-dark"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium text-muted">
            Shortcode (opsional)
          </label>
          <input
            value={manualCode}
            onChange={(e) =>
              setManualCode(e.target.value.replace(/\D/g, "").slice(0, 8))
            }
            placeholder="Otomatis 6 digit"
            inputMode="numeric"
            className="field-input w-full rounded-full border border-primary/15 bg-cream px-4 py-2.5 font-mono text-sm outline-none"
          />
        </div>

        {formError ? <p className="text-xs text-red-700">{formError}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="btn-double-solid w-full rounded-full py-2.5 text-sm font-medium text-cream disabled:opacity-60"
        >
          Buat shortcode & salin link
        </button>
      </form>

      <div className="rounded-2xl border border-primary/10 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-primary/8 px-4 py-3">
          <p className="text-sm font-semibold text-primary-dark">
            Daftar tamu ({guests.length})
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const payload = guests.map((g) => ({
                  code: g.code,
                  name: g.name,
                  side: g.side,
                  createdAt: g.createdAt,
                }));
                const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], {
                  type: "application/json",
                });
                const href = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = href;
                a.download = "guests.json";
                a.click();
                URL.revokeObjectURL(href);
                flash("JSON diunduh");
              }}
              className="text-[11px] font-medium text-primary underline-offset-2 hover:underline"
            >
              Unduh JSON
            </button>
            <Link
              href="/"
              className="text-[11px] font-medium text-primary underline-offset-2 hover:underline"
            >
              Lihat undangan
            </Link>
          </div>
        </div>

        <div className="flex gap-1.5 border-b border-primary/8 px-4 py-2">
          {(
            [
              ["semua", "Semua"],
              ["wanita", "Wanita"],
              ["pria", "Pria"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilter(v)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                filter === v
                  ? "bg-primary-dark text-cream"
                  : "text-primary-dark"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {guests.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">
            Belum ada undangan. Buat shortcode pertama di atas.
          </p>
        ) : (
          <ul className="divide-y divide-primary/8">
            {guests
              .filter((g) => (filter === "semua" ? true : g.side === filter))
              .map((g) => (
              <li key={g.code} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary-dark">
                      {g.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      <span className="font-mono font-bold text-primary-dark">
                        {g.code}
                      </span>
                      {" · "}
                      {g.side === "pria" ? "Pria" : "Wanita"}
                    </p>
                    <p className="mt-1 break-all font-mono text-[10px] text-muted/80">
                      {g.url}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => void copy(g.url, "Link disalin")}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary-dark"
                    >
                      Salin link
                    </button>
                    <button
                      type="button"
                      onClick={() => void copy(g.code, "Kode disalin")}
                      className="rounded-full border border-primary/15 px-2.5 py-1 text-[10px] font-semibold text-primary-dark"
                    >
                      Salin kode
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void copy(
                          getInviteShareText({
                            code: g.code,
                            side: g.side,
                            guestName: g.name,
                          }),
                          "Teks WA disalin",
                        )
                      }
                      className="rounded-full border border-primary/15 px-2.5 py-1 text-[10px] font-semibold text-primary-dark"
                    >
                      Salin teks WA
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete(g.code)}
                      className="rounded-full px-2.5 py-1 text-[10px] font-medium text-red-700/80"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
        Format link:{" "}
        <code className="text-primary-dark">/?c=4821</code>
        {" · "}
        tanpa kode:{" "}
        <code className="text-primary-dark">/?side=pria</code>
        <br />
        Shortcode mengunci nama + sisi. Di VPS/Coolify, pasang volume{" "}
        <code className="text-primary-dark">/app/data</code> agar tamu baru
        tersimpan. Cadangan: tombol Unduh JSON.
      </p>
    </div>
  );
}
