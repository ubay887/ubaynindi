import "server-only";

import { getServerEnv } from "@/server/env";
import { telegramWebhookSecret } from "@/server/telegram/secret";
import { parseAdminIds } from "@/server/telegram/text";

const TOKEN_PATTERN = /^\d{6,12}:[A-Za-z0-9_-]{20,}$/;

export function getTelegramConfig() {
  const env = getServerEnv();
  const rawToken = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const token = TOKEN_PATTERN.test(rawToken) ? rawToken : null;
  return {
    token,
    misconfigured: rawToken.length > 0 && !token,
    adminIds: parseAdminIds(process.env.TELEGRAM_ADMIN_IDS),
    webhookSecret: token ? telegramWebhookSecret(env.rateLimitHmacSecret) : null,
    appOrigin: env.appOrigin,
  };
}
