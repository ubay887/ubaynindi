import { logServerError, requestId } from "@/server/api/errors";
import { deleteEntry, listEntryPage, matchEntryPrefix } from "@/server/guestbook/repository";
import { createTelegramApi } from "@/server/telegram/client";
import { getTelegramConfig } from "@/server/telegram/config";
import { handleIncoming } from "@/server/telegram/handle";
import { secretMatches } from "@/server/telegram/secret";
import { readUpdate } from "@/server/telegram/text";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

export async function POST(request: Request) {
  const id = requestId();
  const config = getTelegramConfig();
  if (config.misconfigured) {
    logServerError(id, "telegram_token_invalid", new Error("invalid token"));
    return new Response(null, { status: 500 });
  }
  if (!config.token || !config.webhookSecret) return new Response(null, { status: 404 });
  const provided = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (!secretMatches(provided, config.webhookSecret)) return new Response(null, { status: 401 });

  let update: unknown;
  try {
    update = await readBody(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "TOO_LARGE";
    return new Response(null, { status: tooLarge ? 413 : 400 });
  }

  const incoming = readUpdate(update);
  if (!incoming) return Response.json({ ok: true });
  try {
    await handleIncoming(incoming, {
      adminIds: config.adminIds,
      guestbook: {
        page: (page) => listEntryPage(page, 5),
        match: matchEntryPrefix,
        async remove(entryId) {
          const removed = await deleteEntry(entryId);
          if (removed) console.info(JSON.stringify({ event: "guestbook_deleted", id: removed.id, via: "telegram" }));
          return removed;
        },
      },
      api: createTelegramApi(config.token),
    });
    return Response.json({ ok: true });
  } catch (error) {
    logServerError(id, "telegram_update_failed", error);
    return new Response(null, { status: 500 });
  }
}

async function readBody(request: Request) {
  if (!request.body) throw new Error("EMPTY");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      total += chunk.value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel("body too large");
        throw new Error("TOO_LARGE");
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(text) as unknown;
}
