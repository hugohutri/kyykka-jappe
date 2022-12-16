import { format, parse } from "fecha";
import { Context } from "telegraf";
import { fetchMatches, Match, Team } from "../helpers/api";
import { compare } from "../helpers/compare-string";
import { reply } from "../helpers/reply";
import { getSearchTerm, getSearchTermOrName } from "../helpers/search-term";
import { getWeatherString } from "../helpers/weather";
import { getTeam } from "../helpers/getTeam";

async function vsCommand(context: Context, searchTerm: string) {
  const matches = await getVsMatches(searchTerm);

  const msg = await getMatchesMessage(matches);
  reply(context, msg);
}

export async function getVsMatches(searchTerm: string) {
  const [team1, team2] = searchTerm.split(" vs ");

  const allMatches = await fetchMatches();
  const matches1 = getMatchesByTeamName(allMatches, team1);
  const matches2 = getMatchesByTeamName(allMatches, team2);

  const matches = [];

  for (const match1 of matches1) {
    for (const match2 of matches2) {
      if (match1.id == match2.id) {
        matches.push(match1);
      }
    }
  }
  return matches;
}

export async function commandFutureMatches(context: Context) {
  const searchTerm = getSearchTerm(context);
  if (searchTerm.includes(" vs ")) {
    return vsCommand(context, searchTerm);
  }

  const allMatches = await fetchMatches();

  const team = getTeam(allMatches, searchTerm);
  // if (!team) return;
  let matches = allMatches;
  if (team) matches = getMatchesByTeam(allMatches, team);
  const futureMatches = filterFutureMatches(matches);
  const msg = await getMatchesMessage(futureMatches, team);
  reply(context, msg);
}

export async function commandOldMatches(context: Context) {
  const searchTerm = getSearchTermOrName(context);
  // if (searchTerm.includes(" vs ")) {
  //   vsCommand(context, searchTerm);
  // }

  const allMatches = await fetchMatches();

  const team = getTeam(allMatches, searchTerm);
  if (!team) return;

  const matches = getMatchesByTeam(allMatches, team);
  const oldMatches = filterOldMatches(matches).reverse();
  const msg = getOldMatchesMessage(oldMatches, team);
  reply(context, msg);
}

export function getMatchesByTeamName(allMatches: Match[], searchTerm: string) {
  return allMatches.filter((match) => isPlayingIn(match, searchTerm));
}

export function getMatchesByTeam(allMatches: Match[], team: Team) {
  return allMatches.filter(
    (match) => match.away_team.id == team.id || match.home_team.id == team.id
  );
}

// TODO: CLEANME
function isPlayingIn(match: Match, teamName: string) {
  if (compare(match.home_team.name, teamName)) return true;
  if (compare(match.home_team.abbreviation, teamName)) return true;
  if (compare(match.away_team.name, teamName)) return true;
  if (compare(match.away_team.abbreviation, teamName)) return true;
  return false;
}

function filterFutureMatches(matches: Match[]) {
  return matches.filter((match) => {
    return !isOldMatch(match);
  });
}

export function filterOldMatches(matches: Match[]) {
  return matches.filter((match) => {
    return isOldMatch(match);
  });
}

function isOldMatch(match: Match) {
  const dateString = match.match_time;
  const matchDate = parse(dateString, "isoDateTime");
  const dateNow = new Date().getTime();
  return dateNow > matchDate!.getTime();
}

async function getMatchesMessage(
  matches: Match[],
  team?: Team,
  title = "Ottelut",
  amount = 5
) {
  const rows = [`${title} ${team?.abbreviation ?? ""}`];

  let i = 1;
  for (const match of matches) {
    const matchString = await getMatchString(match, team);
    rows.push(matchString);
    if (i > amount) break;
    i++;
  }

  return rows.join("\n\n");
}

async function getMatchString(match: Match, team?: Team) {
  const time = parse(match.match_time, "isoDateTime");
  if (!time) throw Error("Invalid time " + match.match_time);
  const timeStr = format(time, "DD.MM.YYYY HH:mm");

  const weather = await getWeatherString(time);
  const field = match.field;
  const home = match.home_team.abbreviation;
  const away = match.away_team.abbreviation;
  const icon = team?.id == match.home_team.id ? "🏠" : " ";

  return `${timeStr} ${weather}\n${home} vs ${away} (kenttä ${field}) ${icon}`;
}

function getOldMatchesMessage(
  matches: Match[],
  team?: Team,
  title = "Tulokset",
  amount = 5
) {
  const rows = [`${title} ${team?.abbreviation ?? ""}`];

  let i = 1;
  for (const match of matches) {
    rows.push(getOldMatchString(match, team));
    if (i > amount) break;
    i++;
  }

  return rows.join("\n\n");
}

function getOldMatchString(match: Match, team?: Team) {
  const time = parse(match.match_time, "isoDateTime");
  if (!time) throw Error("Invalid time " + match.match_time);
  const timeStr = format(time, "DD.MM.YYYY HH:mm");

  const field = match.field;
  const home = match.home_team.abbreviation;
  const away = match.away_team.abbreviation;
  const icon = team?.id == match.home_team.id ? "🏠" : "";

  const home_score = match.home_score_total;
  const away_score = match.away_score_total;
  const winner = home_score < away_score ? home : away;
  const isTie = home_score == away_score;

  const row1 = `${timeStr}\n${home} vs ${away} (kenttä ${field}) ${icon}\n`;
  const row2 = `${home}: ${home_score} pistettä ja ${away}: ${away_score} pistettä\n`;
  let row3 =
    winner == team?.abbreviation
      ? `🥇 Hyvä ${winner}!!! 🥇`
      : `${winner} voitti tällä kertaa...`;

  if (isTie) row3 = "🤝 Tasapeli??? 🤝";
  return row1 + row2 + row3;
}
