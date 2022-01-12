import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { calendarCommand } from "./commands/calendar";
import { commandFutureMatches, commandOldMatches } from "./commands/matches";
import { CMD_TO_FUNCION } from "./commands/player-points";
import { commandPredict } from "./commands/predict";
import { handleStop } from "./helpers/handle-stop";
import { logx } from "./helpers/logx";
import { getWeatherString } from "./helpers/weather";

const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
const bot = new Telegraf(token);
export type Bot = Telegraf<Context<Update>>;

getWeatherString(new Date());

bot.command("ottelut", (ctx) => {
  commandFutureMatches(ctx);
  logx(ctx);
});
bot.command("tulokset", (ctx) => {
  commandOldMatches(ctx);
  logx(ctx);
});
bot.command("kalenteri", (ctx) => {
  calendarCommand(ctx);
  logx(ctx);
});
bot.command("ennusta", (ctx) => {
  commandPredict(ctx);
  logx(ctx);
});

CMD_TO_FUNCION.forEach((callback, commandName) => {
  bot.command(commandName, callback);
});

bot.launch();

handleStop(bot);
