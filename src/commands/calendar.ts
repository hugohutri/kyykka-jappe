import { parse } from "fecha";
import { createReadStream, writeFileSync } from "fs";
import { createEvents, EventAttributes } from "ics";
import { Context } from "telegraf";
import { fetchMatches, Match, Team } from "../helpers/api";
import { getTeam } from "../helpers/getTeam";
import { reply } from "../helpers/reply";
import { getSearchTerm } from "../helpers/search-term";
import { getMatchesByTeamName } from "./matches";

// [Year month day HH min]
// [2000, 1, 5, 10, 0] (January 5, 2000)
export async function calendarCommand(context: Context) {
  const searchTerm = getSearchTerm(context);
  if (!searchTerm) return reply(context, "Käyttö: /kalenteri joukkueenNimi");
  const allMatches = await fetchMatches();

  const team = getTeam(allMatches, searchTerm);
  if (!team) return reply(context, "Käyttö: /kalenteri joukkueenNimi");

  const matches = getMatchesByTeamName(allMatches, team.name);
  await creteCalendarFile(matches, team);
  context.replyWithDocument({
    source: createReadStream(`${__dirname}/ics/${team.id}.ics`),
    filename: "kyykkapelit.ics",
  });
}

async function creteCalendarFile(matches: Match[], team: Team) {
  const events: EventAttributes[] = [];

  matches.forEach((match) => {
    const time = parse(match.match_time, "isoDateTime");
    if (!time) return;
    const event: EventAttributes = {
      title: `Kyykkä ${match.home_team.abbreviation} vs ${match.away_team.abbreviation} (kenttä ${match.field})`,
      description: `${match.home_team.abbreviation} vs ${match.away_team.abbreviation} (${match.field})`,
      busyStatus: "FREE",
      start: [
        time.getFullYear(),
        time.getMonth() + 1,
        time.getDate(),
        time.getHours(),
        time.getMinutes(),
      ],
      duration: { minutes: 30 },
    };
    events.push(event);
  });

  await createFile(events, team.id);
}

function createFile(events: EventAttributes[], id: number) {
  return new Promise((resolve) => {
    createEvents(events, (error, value) => {
      if (error) {
        console.log(error);
      }
      writeFileSync(`${__dirname}/ics/${id}.ics`, value);
      resolve(true);
    });
  });
}
