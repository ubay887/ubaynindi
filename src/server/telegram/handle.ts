import {
  confirmKeyboard,
  confirmText,
  byLatest,
  formatPage,
  formatWish,
  helpText,
  lockedText,
  pageKeyboard,
  type Incoming,
  type Keyboard,
  type WishView,
} from "@/server/telegram/text";

const PAGE_SIZE = 5;

export type GuestbookAdmin = {
  page(page: number): Promise<{ entries: WishView[]; total: number }>;
  match(prefix: string): Promise<WishView[]>;
  remove(id: string): Promise<WishView | null>;
};

export type TelegramApi = {
  send(chatId: number, text: string, keyboard?: Keyboard): Promise<void>;
  edit(chatId: number, messageId: number, text: string, keyboard?: Keyboard): Promise<void>;
  answer(callbackId: string, text?: string): Promise<void>;
};

export type HandlerDeps = {
  adminIds: ReadonlySet<number>;
  guestbook: GuestbookAdmin;
  api: TelegramApi;
};

export async function handleIncoming(input: Incoming, deps: HandlerDeps) {
  if (input.chatType !== "private") {
    if (input.kind === "callback") await deps.api.answer(input.callbackId);
    return;
  }
  if (input.kind === "callback") {
    await handleCallback(input, deps);
    return;
  }

  const [rawCommand, argument = ""] = input.text.trim().split(/\s+/, 2);
  const command = rawCommand?.split("@")[0]?.toLowerCase() ?? "";
  if (command === "/id" || command === "/start") {
    await deps.api.send(input.chatId, accessText(input.fromId, deps.adminIds));
    return;
  }
  if (!isAdmin(input.fromId, deps.adminIds)) {
    if (command === "/list" || command === "/ucapan" || command === "/hapus" || command === "/help") {
      await deps.api.send(input.chatId, lockedText(input.fromId));
    }
    return;
  }
  if (command === "/help") {
    await deps.api.send(input.chatId, helpText());
    return;
  }
  if (command === "/list" || command === "/ucapan") {
    const page = Number(argument || "1");
    await showPage(input.chatId, null, Number.isInteger(page) && page > 0 ? page : 1, deps);
    return;
  }
  if (command === "/hapus") {
    await askByPrefix(input.chatId, null, argument, deps);
    return;
  }
  await deps.api.send(input.chatId, helpText());
}

async function handleCallback(input: Extract<Incoming, { kind: "callback" }>, deps: HandlerDeps) {
  if (!isAdmin(input.fromId, deps.adminIds)) {
    await deps.api.answer(input.callbackId, "Tidak diizinkan.");
    return;
  }
  const listPage = /^list:(\d{1,5})$/.exec(input.data);
  if (listPage) {
    await deps.api.answer(input.callbackId);
    await showPage(input.chatId, input.messageId, Number(listPage[1]), deps);
    return;
  }
  const ask = /^ask:([0-9a-f-]{36})$/i.exec(input.data);
  if (ask) {
    await deps.api.answer(input.callbackId);
    await showConfirm(input.chatId, input.messageId, ask[1]!, deps);
    return;
  }
  const yes = /^yes:([0-9a-f-]{36})$/i.exec(input.data);
  if (yes) {
    const removed = await deps.guestbook.remove(yes[1]!);
    await deps.api.answer(input.callbackId, removed ? "Ucapan dihapus." : "Ucapan sudah tidak ada.");
    await deps.api.edit(input.chatId, input.messageId, removed ? `Ucapan dihapus.\n\n${formatWish(removed, true)}` : "Ucapan sudah tidak ada.", []);
    return;
  }
  if (/^no:[0-9a-f-]{36}$/i.test(input.data)) {
    await deps.api.answer(input.callbackId, "Dibatalkan.");
    await deps.api.edit(input.chatId, input.messageId, "Penghapusan dibatalkan.", []);
    return;
  }
  await deps.api.answer(input.callbackId);
}

async function showPage(chatId: number, messageId: number | null, requested: number, deps: HandlerDeps) {
  const requestedSafe = Math.min(Math.max(requested, 1), 10_000);
  let view = await deps.guestbook.page(requestedSafe);
  const pages = Math.max(1, Math.ceil(view.total / PAGE_SIZE));
  const page = Math.min(requestedSafe, pages);
  if (page !== requestedSafe) view = await deps.guestbook.page(page);
  const text = formatPage(view.entries, view.total, page, PAGE_SIZE);
  const keyboard = pageKeyboard(view.entries, view.total, page, PAGE_SIZE);
  if (messageId) await deps.api.edit(chatId, messageId, text, keyboard);
  else await deps.api.send(chatId, text, keyboard);
}

async function showConfirm(chatId: number, messageId: number | null, id: string, deps: HandlerDeps) {
  const matches = await deps.guestbook.match(id);
  const entry = matches.find((item) => item.id.toLowerCase() === id.toLowerCase());
  const text = entry ? confirmText(entry) : "Ucapan sudah tidak ada.";
  const keyboard = entry ? confirmKeyboard(entry.id) : [];
  if (messageId) await deps.api.edit(chatId, messageId, text, keyboard);
  else await deps.api.send(chatId, text, keyboard);
}

async function askByPrefix(chatId: number, messageId: number | null, prefix: string, deps: HandlerDeps) {
  if (!/^[0-9a-f-]{4,36}$/i.test(prefix)) {
    await deps.api.send(chatId, "Kirim minimal 4 karakter dari ID ucapan.\nContoh: /hapus 81f47930");
    return;
  }
  const matches = await deps.guestbook.match(prefix);
  if (matches.length === 1 && matches[0]) {
    await showConfirm(chatId, messageId, matches[0].id, deps);
    return;
  }
  if (!matches.length) {
    await deps.api.send(chatId, "Tidak ada ucapan dengan awalan itu.");
    return;
  }
  const ordered = byLatest(matches);
  const text = `Ada ${ordered.length} ucapan. Yang terbaru di atas.\n\n${ordered.map((entry) => formatWish(entry)).join("\n\n")}`;
  await deps.api.send(chatId, text, pageKeyboard(ordered, ordered.length, 1, ordered.length));
}

function accessText(fromId: number | null, adminIds: ReadonlySet<number>) {
  if (isAdmin(fromId, adminIds)) return `Kamu admin buku tamu.\nID Telegram: ${fromId}\n\n${helpText()}`;
  return lockedText(fromId);
}

function isAdmin(fromId: number | null, adminIds: ReadonlySet<number>) {
  return fromId !== null && adminIds.has(fromId);
}
