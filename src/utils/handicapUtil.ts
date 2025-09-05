import type { CompleteRound } from "../supabase/supabaseClient";

const PER_HOLE_MAX = 6; // Any holes with more than 6 strokes will be set to 6
const PAR_TOTAL = 15; // 3 par on all holes
const NORMALIZE_FACTOR = 18 / 5; // To normalize for a 18-hole golf course

export const calculateHandicap = (
  rounds: CompleteRound[]
): number | undefined => {
  const last20Rounds = rounds
    .sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    })
    .slice(0, 20);

  const differentials = last20Rounds.map((r) => {
    const ags = adjustedGross(r);
    return differentialFromAGS(ags);
  });

  const nBest = countBestUsed(differentials.length);
  if (nBest === 0) return undefined;

  const best = differentials.sort((a, b) => a - b).slice(0, nBest);
  const avg = best.reduce((s, x) => s + x, 0) / nBest;
  return +avg.toFixed(1);
};

function countBestUsed(nRounds: number): number {
  if (nRounds >= 20) return 8;
  if (nRounds === 19) return 7;
  if (nRounds >= 17) return 6;
  if (nRounds >= 15) return 5;
  if (nRounds >= 12) return 4;
  if (nRounds >= 9) return 3;
  if (nRounds >= 6) return 2;
  if (nRounds >= 3) return 1;
  return 0;
}

function adjustedGross(round: CompleteRound): number {
  const values = [
    Math.min(round.first_hole, PER_HOLE_MAX),
    Math.min(round.second_hole, PER_HOLE_MAX),
    Math.min(round.third_hole, PER_HOLE_MAX),
    Math.min(round.fourth_hole, PER_HOLE_MAX),
    Math.min(round.fifth_hole, PER_HOLE_MAX),
  ];
  return values.reduce((partialSum, a) => partialSum + a, 0);
}

function differentialFromAGS(ags: number): number {
  return (ags - PAR_TOTAL) * NORMALIZE_FACTOR;
}
