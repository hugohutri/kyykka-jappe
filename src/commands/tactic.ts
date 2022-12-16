import { Context } from "telegraf/typings/context";
import { fetchMatches, fetchPlayers } from "../helpers/api";
import { getTeam } from "../helpers/getTeam";
import { reply } from "../helpers/reply";
import { getSearchTerm } from "../helpers/search-term";
import { getMatchesByTeamName } from "./matches";
import { findPlayersByTeam } from "./player-points";

export async function tactic(context: Context) {
  const searchTerm = getSearchTerm(context);
  if (!searchTerm.includes(" vs ")) return;
  const [ourName, enemyName] = searchTerm.split(" vs ");

  const allMatches = await fetchMatches();
  const ourMatches = getMatchesByTeamName(allMatches, ourName);
  const enemyMatches = getMatchesByTeamName(allMatches, enemyName);

  const matches = [];

  for (const match1 of ourMatches) {
    for (const match2 of enemyMatches) {
      if (match1.id == match2.id) {
        matches.push(match1);
      }
    }
  }
  if (matches.length == 0) return;

  const ourTeam = getTeam(matches, ourName);
  const enemyTeam = getTeam(matches, enemyName);

  if (!ourTeam) return;
  if (!enemyTeam) return;

  const allPlayers = await fetchPlayers();
  const ourPlayers = findPlayersByTeam(allPlayers, ourTeam?.name);
  const enemyPlayers = findPlayersByTeam(allPlayers, enemyTeam?.name);

  ourPlayers.sort((a, b) => b.score_per_throw - a.score_per_throw);
  enemyPlayers.sort((a, b) => b.score_per_throw - a.score_per_throw);

  const msg = `Okei äijät, tässä mun uus taktiikka:
Ekana meidän pitää juottaa vastustajan tiimistä ainakin 2 parasta, eli juotetaan ${enemyPlayers[0].player_name} Jallulla ja ${enemyPlayers[1].player_name} Gambiinalla. (Voisko esim ${ourPlayers?.[5].player_name} ottaa koppia tästä?)

Ja sitten äijät, meidän täytyy valita voittoporukka tähän. Mun mielestä vedetää vaikka parhaat pph pelaajat, eli ne olis ${ourPlayers[0].player_name}, ${ourPlayers[1].player_name}, ${ourPlayers[2].player_name} ja ${ourPlayers[3].player_name}.

Ei mulla muuta, tää oli mun plän. RSÄ :D`;

  reply(context, msg);
}
