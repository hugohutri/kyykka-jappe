import { Bot } from "../index";

export const handleStop = (bot: Bot) => {
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
};
