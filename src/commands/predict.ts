import { Context } from "telegraf";
import { fetchMatches, Match, Team } from "../helpers/api";
import { reply } from "../helpers/reply";
import { getSearchTerm } from "../helpers/search-term";
import { filterOldMatches, getMatchesByTeam } from "./matches";
import { getTeam } from "../helpers/getTeam";

export async function commandPredict(context: Context) {
  const searchTerm = getSearchTerm(context);
  if (!searchTerm.includes(" vs "))
    return reply(context, "Käyttö: /ennusta joukkue1 vs joukkue2");

  const [searchA, searchB] = searchTerm.split(" vs ");
  const allMatches = await fetchMatches();

  const teamA = getTeam(allMatches, searchA);
  const teamB = getTeam(allMatches, searchB);

  if (!teamA) return reply(context, `Joukkuetta ${searchA} ei löytynyt`);
  if (!teamB) return reply(context, `Joukkuetta ${searchB} ei löytynyt`);

  let matchesA = getMatchesByTeam(allMatches, teamA);
  let matchesB = getMatchesByTeam(allMatches, teamB);
  matchesA = filterOldMatches(matchesA);
  matchesB = filterOldMatches(matchesB);

  const matches = [];

  for (const matchA of matchesA) {
    for (const matchB of matchesB) {
      if (matchA.id == matchB.id) {
        matches.push(matchA);
      }
    }
  }

  const avgA = getAverageScore(matchesA, teamA);
  const avgB = getAverageScore(matchesB, teamB);
  const winner = avgA < avgB ? teamA : teamB;
  let msg = `Ennuste pelille ${teamA.abbreviation} vs ${teamB.abbreviation}:\n\n`;
  msg += `${teamA.abbreviation}: ${avgA.toFixed(1)}\n`;
  msg += `${teamB.abbreviation}: ${avgB.toFixed(1)}\n\n`;
  let prediction = `Veikkaan siis että ${winner.abbreviation} voittaa (ehkä)`;
  if (Math.abs(avgA - avgB) < 1) prediction = "Veikkaan että tasapeli XD";
  msg += prediction;
  reply(context, msg);
}

function getAverageScore(matches: Match[], team: Team) {
  let total = 0;
  let matchesPlayed = 0;

  for (const match of matches) {
    // if (match.home_score_total == 0 && match.away_score_total == 0) {
    if (!match.is_validated) {
      continue;
    }

    const score = getScore(match, team);
    total += score;
    matchesPlayed += 1;
  }

  return total / matchesPlayed;
}

function getScore(match: Match, team: Team) {
  if (match.home_team.id == team.id) return match.home_score_total;
  if (match.away_team.id == team.id) return match.away_score_total;
  throw new Error("Invalid team " + team.abbreviation);
}
