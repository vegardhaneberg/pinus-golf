import type { Player } from "../supabase/supabaseClient";

export interface HoleScore {
  name: string;
  hole: number;
  par: number;
  score: number;
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

export interface RoundAttempt {
  hole1: number;
  hole2: number;
  hole3: number;
  hole4: number;
  hole5: number;
  player?: Player;
}
