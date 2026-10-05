import { getServerEnv } from "@/server/env";
import { errorResponse, logServerError, requestId } from "@/server/api/errors";
import { decodeCursor } from "@/server/guestbook/cursor";
import { createEntry, listEntries } from "@/server/guestbook/repository";
import { parseGuestbookInput } from "@/server/guestbook/schema";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 4 * 1024;
let degradedProxyWarningLogged = false;

function jsonHeaders() {
  return { "Cache-Control": "no-store" };
}

async function readBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  if (!request.body) throw new Error("INVALID_PAYLOAD");
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
        throw new Error("BODY_TOO_LARGE");
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("INVALID_PAYLOAD");
  }
}

function validateOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === getServerEnv().appOrigin;
}

function clientIdentity(request: Request): string | null {
  const env = getServerEnv();
  if (env.trustedProxyHeader && !env.trustedProxyVerified && !degradedProxyWarningLogged) {
    degradedProxyWarningLogged = true;
    console.warn(JSON.stringify({ event: "trusted_proxy_unverified", mode: "global_only" }));
  }
  if (!env.trustedProxyHeader || !env.trustedProxyVerified) return null;
  return request.headers.get(env.trustedProxyHeader)?.trim() || null;
}

export async function GET(request: Request) {
  const id = requestId();
  try {
    const url = new URL(request.url);
    const rawLimit = url.searchParams.get("limit");
    const limit = rawLimit === null ? 20 : Number(rawLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      return errorResponse(id, 400, "INVALID_REQUEST", "Jumlah ucapan tidak valid.");
    }
    const cursor = decodeCursor(url.searchParams.get("cursor"));
    const data = await listEntries(limit, cursor);
    return Response.json(data, { headers: jsonHeaders() });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CURSOR") {
      return errorResponse(id, 400, "INVALID_REQUEST", "Tautan halaman ucapan tidak valid.");
    }
    logServerError(id, "guestbook_read_failed", error);
    return errorResponse(id, 503, "GUESTBOOK_UNAVAILABLE", "Ucapan belum dapat dimuat. Silakan coba lagi.");
  }
}

export async function POST(request: Request) {
  const id = requestId();
  try {
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      return errorResponse(id, 415, "INVALID_REQUEST", "Format kiriman tidak didukung.");
    }
    if (!validateOrigin(request)) {
      return errorResponse(id, 403, "ORIGIN_REJECTED", "Kiriman hanya dapat dilakukan dari halaman undangan.");
    }
    const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
    if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) {
      return errorResponse(id, 400, "INVALID_REQUEST", "Sesi kiriman tidak valid. Silakan coba lagi.");
    }
    const body = await readBody(request);
    const input = parseGuestbookInput(body);
    if (input.honeypot || (input.formStartedAt !== null && Date.now() - input.formStartedAt < 700)) {
      return errorResponse(id, 400, "INVALID_PAYLOAD", "Mohon lengkapi kiriman dengan wajar.");
    }
    const result = await createEntry(input, idempotencyKey, clientIdentity(request));
    if (result.limited) {
      return errorResponse(id, 429, "RATE_LIMITED", "Terima kasih. Silakan tunggu sebentar sebelum mengirim lagi.", { retryAfter: 60 });
    }
    return Response.json(result.entry, { status: result.replayed ? 200 : 201, headers: { ...jsonHeaders(), "X-Request-ID": id } });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "BODY_TOO_LARGE") return errorResponse(id, 413, "BODY_TOO_LARGE", "Kiriman terlalu besar.");
      if (error.message.startsWith("INVALID_")) return errorResponse(id, 400, "INVALID_PAYLOAD", "Periksa kembali nama, ucapan, dan konfirmasi kehadiran.");
    }
    logServerError(id, "guestbook_write_failed", error);
    return errorResponse(id, 503, "GUESTBOOK_UNAVAILABLE", "Ucapan belum dapat dikirim. Data Anda tetap di formulir; silakan coba lagi.");
  }
}
