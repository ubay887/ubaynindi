import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  addGuest,
  GuestStoreError,
  invitePath,
  readGuests,
  removeGuest,
} from "@/lib/guests";
import { getSiteUrl } from "@/config/wedding";
import type { InviteSide } from "@/types/wedding";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const guests = await readGuests();
  const siteUrl = getSiteUrl();
  return NextResponse.json({
    guests: guests.map((g) => ({
      ...g,
      url: invitePath(g, siteUrl),
    })),
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; side?: InviteSide; code?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  try {
    const guest = await addGuest({
      name: body.name ?? "",
      side: body.side ?? "wanita",
      code: body.code,
    });
    return NextResponse.json({
      guest: {
        ...guest,
        url: invitePath(guest, getSiteUrl()),
      },
    });
  } catch (e) {
    if (e instanceof GuestStoreError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    const msg = e instanceof Error ? e.message : "Gagal menambah tamu.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? "";
  try {
    const ok = await removeGuest(code);
    if (!ok) {
      return NextResponse.json({ error: "Kode tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof GuestStoreError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    throw e;
  }
}
