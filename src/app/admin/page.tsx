"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  getInviteShareText,
  getInviteUrl,
  wedding,
} from "@/config/wedding";
import { copyToClipboard } from "@/lib/utils";
import type { InviteSide } from "@/types/wedding";

type GeneratedLink = {
  id: string;
  name: string;
  side: InviteSide;
  url: string;
  shareText: string;
};

export default function AdminPage() {
  const [name, setName] = useState("");
  const [side, setSide] = useState<InviteSide>("wanita");
  const [links, setLinks] = useState<GeneratedLink[]>([]);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    const guestName = name.replace(/\s+/g, " ").trim().slice(0, 80);
    if (guestName.length < 2) {
      setFormError("Nama minimal 2 karakter.");
      return;
    }

    setFormError("");
    const item: GeneratedLink = {
      id: `${Date.now()}-${Math.random()}`,
      name: guestName,
      side,
      url: getInviteUrl({ side, guestName }),
      shareText: getInviteShareText({ side, guestName }),
    };

    setLinks((current) => [item, ...current]);
    setName("");
    const copied = await copyToClipboard(item.url);
    flash(copied ? "Link dibuat dan disalin" : "Link berhasil dibuat");
  };

  const copy = async (value: string, message: string) => {
    flash((await copyToClipboard(value)) ? message : "Gagal menyalin");
  };

  const downloadJson = () => {
    const payload = links.map(({ id, name: guestName, side: inviteSide, url }) => ({
      id,
      name: guestName,
      side: inviteSide,
      url,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "generated-invite-links.json";
    anchor.click();
    URL.revokeObjectURL(href);
    flash("JSON diunduh");
  };

  return (
    <main className="mx-auto max-w-[48rem] px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Kelola Undangan
          </p>
          <h1 className="font-serif text-2xl text-primary-dark">
            Generator Link
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {wedding.couple.displayNames} · link langsung berbasis nama
          </p>
        </div>
        <Link
          href="/"
          className="min-h-11 rounded-full border border-primary/20 px-3 py-2 text-xs font-medium text-primary-dark"
        >
          Lihat undangan
        </Link>
      </header>

      {toast ? (
        <div role="status" className="mb-4 rounded-xl bg-primary-dark px-3 py-2 text-center text-xs font-medium text-cream">
          {toast}
        </div>
      ) : null}

      <div className="mb-6 rounded-2xl border border-gold/35 bg-gold/10 px-4 py-3 text-xs leading-relaxed text-primary-dark">
        Tidak memakai login atau short code. Nama tamu dimasukkan langsung ke
        URL dan daftar di bawah hanya tersimpan selama halaman ini terbuka.
      </div>

      <form
        onSubmit={onCreate}
        className="mb-6 space-y-3 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm"
      >
        <div>
            <label htmlFor="admin-guest-name" className="mb-1 block text-[11px] font-medium text-muted">
            Nama tamu
          </label>
          <input
            id="admin-guest-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Bapak Andi dan Keluarga"
            className="field-input w-full rounded-full border border-primary/15 bg-cream px-4 py-2.5 text-sm outline-none"
            required
            minLength={2}
            maxLength={80}
          />
        </div>

        <fieldset>
          <legend className="mb-1.5 text-[11px] font-medium text-muted">
            Jenis undangan
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["wanita", "Pihak Wanita"],
                ["pria", "Pihak Pria"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSide(value)}
                className={`min-h-11 rounded-full border py-2 text-xs font-semibold transition ${
                  side === value
                    ? "border-primary-dark bg-primary-dark text-cream"
                    : "border-primary/15 text-primary-dark"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {formError ? <p className="text-xs text-red-700">{formError}</p> : null}

        <button
          type="submit"
          className="btn-double-solid w-full rounded-full py-2.5 text-sm font-medium text-cream"
        >
          Buat link & salin
        </button>
      </form>

      <div className="rounded-2xl border border-primary/10 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-primary/8 px-4 py-3">
          <p className="text-sm font-semibold text-primary-dark">
            Link dibuat ({links.length})
          </p>
          {links.length ? (
            <button
              type="button"
              onClick={downloadJson}
              className="text-[11px] font-medium text-primary underline-offset-2 hover:underline"
            >
              Unduh JSON
            </button>
          ) : null}
        </div>

        {links.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">
            Belum ada link. Isi nama tamu untuk membuat link pertama.
          </p>
        ) : (
          <ul className="divide-y divide-primary/8">
            {links.map((item) => (
              <li key={item.id} className="px-4 py-3">
                <p className="truncate text-sm font-semibold text-primary-dark">
                  {item.name}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {item.side === "pria" ? "Pihak Pria" : "Pihak Wanita"}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block max-w-full break-words font-mono text-[10px] text-muted/80 underline-offset-2 hover:underline"
                >
                  {item.url}
                </a>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => void copy(item.url, "Link disalin")}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary-dark"
                  >
                    Salin link
                  </button>
                  <button
                    type="button"
                    onClick={() => void copy(item.shareText, "Teks WA disalin")}
                    className="rounded-full border border-primary/15 px-2.5 py-1 text-[10px] font-semibold text-primary-dark"
                  >
                    Salin teks WA
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLinks((current) => current.filter((link) => link.id !== item.id))
                    }
                    className="rounded-full px-2.5 py-1 text-[10px] font-medium text-red-700/80"
                  >
                    Hapus dari daftar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
