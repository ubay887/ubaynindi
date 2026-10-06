import "server-only";

import type { Keyboard } from "@/server/telegram/text";

export function createTelegramApi(token: string) {
  return {
    send(chatId: number, text: string, keyboard?: Keyboard) {
      return call(token, "sendMessage", { chat_id: chatId, text, parse_mode: "HTML", reply_markup: markup(keyboard), link_preview_options: { is_disabled: true } });
    },
    edit(chatId: number, messageId: number, text: string, keyboard?: Keyboard) {
      return call(token, "editMessageText", { chat_id: chatId, message_id: messageId, text, parse_mode: "HTML", reply_markup: markup(keyboard), link_preview_options: { is_disabled: true } });
    },
    answer(callbackId: string, text?: string) {
      return call(token, "answerCallbackQuery", { callback_query_id: callbackId, text, show_alert: Boolean(text) });
    },
  };
}

function markup(keyboard?: Keyboard) {
  if (!keyboard) return undefined;
  return { inline_keyboard: keyboard.map((row) => row.map((button) => ({ text: button.text.slice(0, 64), callback_data: button.data }))) };
}

async function call(token: string, method: string, body: unknown) {
  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error(`Telegram ${method} unreachable`);
  }
  if (!response.ok) throw new Error(`Telegram ${method} failed (${response.status})`);
  const payload = await response.json().catch(() => null) as { ok?: boolean } | null;
  if (!payload?.ok) throw new Error(`Telegram ${method} rejected`);
}
