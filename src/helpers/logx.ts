import { Context } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";

export const logx = (ctx: Context) => {
  const firstName = ctx.message?.from.first_name;
  const lastName = ctx.message?.from.last_name;
  const username = ctx.message?.from.username;

  let name = "";
  if (firstName) name += firstName;
  if (lastName) name += lastName;
  if (name == "") name = username || "Unknown";

  const message = ctx.message as Message.TextMessage;
  console.log(`[${name}] ${message.text}`);
};
