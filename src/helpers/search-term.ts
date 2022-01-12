import { Context } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";

export function getSearchTermOrName(ctx: Context) {
  const message = ctx.message as Message.TextMessage;
  const args = message.text.split(" ");
  args.shift(); // Remove the command itself

  if (args.length > 0) {
    return args.join(" ").toLowerCase();
  } else {
    return getSenderName(ctx).toLowerCase();
  }
}

export function getSearchTerm(ctx: Context) {
  const message = ctx.message as Message.TextMessage;
  const args = message.text.split(" ");
  args.shift(); // Remove the command itself

  if (args.length > 0) {
    return args.join(" ").toLowerCase();
  }
  return "";
}

function getSenderName(ctx: Context) {
  const sender = ctx.message?.from;

  const names = [];
  if (sender?.first_name) names.push(sender.first_name);
  if (sender?.last_name) names.push(sender.last_name);

  return names.join(" ");
}
