// def get_players_data():
//     url = requests.get("https://kyykka.com/api/players/?season=3")
//     text = url.text

import fetch from "cross-fetch";

//     return json.loads(text)
type KeyValuePair = { [key: string]: number };

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Player {
  id: number;
  player_name: string;
  player_number: string;
  team: Team;
  score_total: number;
  rounds_total: number;
  pikes_total: number;
  zeros_total: number;
  gteSix_total: number;
  throws_total: number;
  pike_percentage: number;
  score_per_throw: number;
  scaled_points?: any;
  scaled_points_per_round?: any;
  avg_throw_turn: number;
  is_captain: boolean;
  [key: string]: any;
}

export async function fetchPlayers() {
  const res = await fetch("https://kyykka.com/api/players/?season=3");
  const data: Player[] = await res.json();
  return data;
}

export interface HomeTeam {
  id: number;
  name: string;
  abbreviation: string;
}

export interface AwayTeam {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Match {
  id: number;
  match_time: string;
  field: number;
  home_team: HomeTeam;
  away_team: AwayTeam;
  home_score_total: number;
  away_score_total: number;
  post_season: boolean;
  is_validated: boolean;
}

export async function fetchMatches() {
  const res = await fetch("https://kyykka.com/api/matches/?season=3");
  const data: Match[] = await res.json();
  return data;
}
