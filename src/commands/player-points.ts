// player_command_names = {
//     "pisteet": "score_total",
//     "kierrokset": "rounds_total",
//     "hauet": "pikes_total",
//     "virkamiehet": "zeros_total",
//     "joulukuuset": "gteSix_total",
//     "heitot": "throws_total",
//     "haukiprosentti": "pike_percentage",
//     "pph": "score_per_throw",
//     "heittovuoro": "avg_throw_turn",
// }

import { Context } from "telegraf";
import { fetchPlayers, Player } from "../helpers/api";
import { getSearchTermOrName } from "../helpers/search-term";
import { compare } from "../helpers/compare-string";
import { reply } from "../helpers/reply";

type PlayerCommand =
  | "pisteet"
  | "kierrokset"
  | "hauet"
  | "virkamiehet"
  | "joulukuuset"
  | "heitot"
  | "haukiprosentti"
  | "pph"
  | "heittovuoro";

const CMD_TO_API_KEY = new Map<PlayerCommand, string>([
  ["pisteet", "score_total"],
  ["kierrokset", "rounds_total"],
  ["hauet", "pikes_total"],
  ["virkamiehet", "zeros_total"],
  ["joulukuuset", "gteSix_total"],
  ["heitot", "throws_total"],
  ["haukiprosentti", "pike_percentage"],
  ["pph", "score_per_throw"],
  ["heittovuoro", "avg_throw_turn"],
]);

const getApiKey = (cmd: PlayerCommand) => {
  const key = CMD_TO_API_KEY.get(cmd);
  if (!key) throw "Missing command: " + cmd;
  return key;
};

export const CMD_TO_FUNCION = new Map<string, (context: Context) => void>();

CMD_TO_API_KEY.forEach((_, cmd_fi) => {
  const cmdFunction = (context: Context) => {
    commandTemplate(context, cmd_fi);
  };
  CMD_TO_FUNCION.set(cmd_fi, cmdFunction);
});

async function commandTemplate(context: Context, cmd: PlayerCommand) {
  const searchTerm = getSearchTermOrName(context);
  const allPlayers = await fetchPlayers();

  {
    // Search by player name
    const players = findPlayersByName(allPlayers, searchTerm);
    const msg = getPlayerMessage(players, cmd);
    reply(context, msg);
  }

  {
    // Search by team name
    const teamPlayers = findPlayersByTeam(allPlayers, searchTerm);
    const msg = getTeamPlayersMessage(teamPlayers, cmd);
    reply(context, msg);
  }
}

function findPlayersByName(allPlayers: Player[], searchTerm: string) {
  return allPlayers.filter((player) => compare(player.player_name, searchTerm));
}

export function findPlayersByTeam(allPlayers: Player[], searchTerm: string) {
  if (!searchTerm) return [];
  return allPlayers.filter(
    (player) =>
      compare(player.team.name, searchTerm) ||
      compare(player.team.abbreviation, searchTerm)
  );
}

function getTeamPlayersMessage(players: Player[], cmd: PlayerCommand) {
  if (players.length == 0) return "";
  const { name, abbreviation } = players[0].team;
  const rows = [`Joukkueen ${name} (${abbreviation}) ${cmd}:`];
  const key = getApiKey(cmd);

  players.sort((a, b) => b[key] - a[key]);

  let rank = 1;
  for (const player of players) {
    const value = player[key];
    const name = player.player_name;
    rows.push(`${rank}: ${name} ${cmd}: ${value}`);
    rank++;
  }

  return rows.join("\n\n");
}

function getPlayerMessage(players: Player[], cmd: PlayerCommand) {
  const rows = [];
  const key = getApiKey(cmd);

  for (const player of players) {
    const value = player[key];
    const name = player.player_name;
    const team = player.team.abbreviation;
    rows.push(`Pelaaja ${name} (${team}):\n${cmd}: ${value}`);
  }

  return rows.join("\n\n");
}
