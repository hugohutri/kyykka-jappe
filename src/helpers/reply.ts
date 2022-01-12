import { Context } from "telegraf";

export function reply(context: Context, msg: string) {
  if (!msg) return;
  context.reply(msg);
}
