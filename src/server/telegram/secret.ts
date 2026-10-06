import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const WEBHOOK_LABEL = "ubaynindi-telegram-webhook-v1";

export function telegramWebhookSecret(hmacKey: string) {
  return createHmac("sha256", hmacKey).update(WEBHOOK_LABEL).digest("base64url").slice(0, 48);
}

export function secretMatches(provided: string, expected: string) {
  const left = createHash("sha256").update(provided).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}
