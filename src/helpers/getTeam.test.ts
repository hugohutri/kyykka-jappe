import { Match } from "./api";
import { getTeam } from "./getTeam";

const mockMatches: Match[] = [
  {
    id: 1446,
    match_time: "2022-01-08T10:00:00+02:00",
    field: 1,
    home_team: {
      id: 66,
      name: "Tiimi 1",
      abbreviation: "T1",
    },
    away_team: {
      id: 60,
      name: "A Long team Name",
      abbreviation: "ALTM",
    },
    home_score_total: 54,
    away_score_total: 32,
    post_season: false,
    is_validated: true,
  },
  {
    id: 1447,
    match_time: "2022-01-08T10:00:00+02:00",
    field: 2,
    home_team: {
      id: 39,
      name: "Another tean name",
      abbreviation: "ATN",
    },
    away_team: {
      id: 18,
      name: "Kyykkäkerho RSÄ",
      abbreviation: "KyRSÄ",
    },
    home_score_total: 53,
    away_score_total: 30,
    post_season: false,
    is_validated: true,
  },
  {
    id: 1448,
    match_time: "2022-01-08T10:00:00+02:00",
    field: 3,
    home_team: {
      id: 26,
      name: "MockName",
      abbreviation: "MoNa",
    },
    away_team: {
      id: 62,
      name: "Aa Bb Cc",
      abbreviation: "abc",
    },
    home_score_total: 22,
    away_score_total: 32,
    post_season: false,
    is_validated: true,
  },
  {
    id: 1449,
    match_time: "2022-01-08T10:00:00+02:00",
    field: 4,
    home_team: {
      id: 24,
      name: "Similarname",
      abbreviation: "sim",
    },
    away_team: {
      id: 58,
      name: "Similarname2",
      abbreviation: "sim2",
    },
    home_score_total: 46,
    away_score_total: 72,
    post_season: false,
    is_validated: true,
  },
  {
    id: 1450,
    match_time: "2022-01-08T10:00:00+02:00",
    field: 5,
    home_team: {
      id: 33,
      name: "Short name",
      abbreviation: "SN",
    },
    away_team: {
      id: 54,
      name: "Short name 2",
      abbreviation: "SN2",
    },
    home_score_total: 49,
    away_score_total: 54,
    post_season: false,
    is_validated: true,
  },
];

test("get team test", () => {
  expect(getTeam([], "test")).toBeUndefined();

  expect(getTeam(mockMatches, "Short name")).toEqual({
    id: 33,
    name: "Short name",
    abbreviation: "SN",
  });

  expect(getTeam(mockMatches, "Short name 2")).toEqual({
    id: 54,
    name: "Short name 2",
    abbreviation: "SN2",
  });

  expect(
    getTeam(mockMatches, "Any team doesnt have this name")
  ).not.toBeUndefined();
});
