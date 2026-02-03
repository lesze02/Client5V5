export type GameType = "CS" | "LOL";

const roles = ["top", "jg", "mid", "adc", "support"] as const;
export type Role = typeof roles[number];

export interface Player {
  id: number;
  name: string;
  role?: Role;
}

export interface Team {
  players: Player[];
}

export interface Match {
  id: number;
  game: GameType;
  teamA: Team;
  teamB: Team;
  status: "ACTIVE" | "FINISHED";
}