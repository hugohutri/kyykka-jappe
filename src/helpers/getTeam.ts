import { Match, Team } from "./api";
import { compare } from "./compare-string";
import { getSimilarity } from "./similarity";

// TODO: CLEANME

export function getTeam(matches: Match[], nick: string) {
  let team: Team | undefined;
  let sim = 0;

  for (const match of matches) {
    const homeSim = getTeamSimilarity(match.home_team, nick);
    const awaySim = getTeamSimilarity(match.away_team, nick);

    if (homeSim > sim) {
      team = match.home_team;
      sim = homeSim;
    }
    if (awaySim > sim) {
      team = match.away_team;
      sim = awaySim;
    }
  }
  return team;
}

function getTeamSimilarity(team: Team, str: string) {
  const abbrSim = getSimilarity(str, team.abbreviation);
  const nameSim = getSimilarity(str, team.name);
  return Math.max(abbrSim, nameSim);
}

// export function getTeam(matches: Match[], searchTerm: string) {
//   for (const match of matches) {
//     if (compare(match.home_team.name, searchTerm)) return match.home_team;
//     if (compare(match.home_team.abbreviation, searchTerm))
//       return match.home_team;
//     if (compare(match.away_team.name, searchTerm)) return match.away_team;
//     if (compare(match.away_team.abbreviation, searchTerm))
//       return match.away_team;
//   }
// }
