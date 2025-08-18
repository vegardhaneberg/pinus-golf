export interface Player {
  id: string;
  name: string;
}

export interface HoleScore {
  name: string;
  hole: number;
  par: number;
  score: number;
}

export interface Round {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  scores: HoleScore[];
  totalScore: number;
  totalPar: number;
}

export interface Course {
  name: string;
  holes: Array<{
    name: string;
    number: number;
    par: number;
    description: string | undefined;
  }>;
}
