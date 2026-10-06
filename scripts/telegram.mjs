import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const WEBHOOK_LABEL = "ubaynindi-telegram-webhook-v1";
const command = process.argv[2] ?? "webhook";

loadEnv(".env");
loadEnv(".env.local");

try {
  if (command === "webhook") await registerWebhook();
  else if (command === "poll") await poll();
  else {
    console.log("Usage: telegram.mjs webhook | poll");
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Telegram command failed");
  process.exitCode = 1;
}

function webhookSecret(key) {
  return createHmac("sha256", key).update(WEBHOOK_LABEL).digest("base64url").slice(0, 48);
}

async function registerWebhook() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.log("TELEGRAM_BOT_TOKEN tidak diisi. Webhook dilewati.");
    return;
  }
  const origin = process.env.APP_ORIGIN?.trim().replace(/\/$/, "");
  if (!origin?.startsWith("https://")) {
    console.log("APP_ORIGIN bukan HTTPS. Webhook dilewati.");
    return;
  }
  const key = process.env.RATE_LIMIT_HMAC_SECRET?.trim();
  if (!key) throw new Error("Missing RATE_LIMIT_HMAC_SECRET.");
  const url = `${origin}/api/telegram/webhook`;
  await telegram(token, "setWebhook", {
    url,
    secret_token: webhookSecret(key),
    allowed_updates: ["message", "callback_query"],
  });
  console.log(`Webhook terpasang di ${url}`);
}

async function poll() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const key = process.env.RATE_LIMIT_HMAC_SECRET?.trim();
  if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN.");
  if (!key) throw new Error("Missing RATE_LIMIT_HMAC_SECRET.");
  const me = await telegram(token, "getMe");
  console.log(`Bot @${me.username ?? "unknown"} siap. Kirim /id di chat pribadi.`);
  await telegram(token, "deleteWebhook", {});
  console.log("Mode lokal: webhook dimatikan agar polling berjalan. Setelah deploy, jalankan npm run telegram:webhook.");
  const secret = webhookSecret(key);
  const local = process.env.TELEGRAM_POLL_URL?.trim() || "http://127.0.0.1:3000/api/telegram/webhook";
  let offset = 0;
  while (true) {
    let updates = [];
    try {
      updates = await telegram(token, "getUpdates", { offset, timeout: 25, allowed_updates: ["message", "callback_query"] });
    } catch (error) {
      console.error(error instanceof Error ? error.message : "Telegram poll failed");
      await sleep(3000);
      continue;
    }
    for (const update of updates) {
      if (typeof update?.update_id !== "number") continue;
      try {
        const response = await fetch(local, {
          method: "POST",
          headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": secret },
          body: JSON.stringify(update),
          signal: AbortSignal.timeout(20_000),
        });
        if (!response.ok) {
          console.error(`Local webhook ${response.status}`);
          await sleep(3000);
          break;
        }
        offset = update.update_id + 1;
      } catch {
        console.error("Local webhook unreachable");
        await sleep(3000);
        break;
      }
    }
  }
}

async function telegram(token, method, body) {
  let response;
  try {
    response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(method === "getUpdates" ? 40_000 : 15_000),
    });
  } catch {
    throw new Error(`Telegram ${method} unreachable`);
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) throw new Error(`Telegram ${method} failed (${response.status})`);
  return payload.result;
}

function loadEnv(file) {
  if (!existsSync(file)) return;
  const initial = loadEnv.initial ??= new Set(Object.keys(process.env));
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (initial.has(key)) continue;
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[key] = value;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
