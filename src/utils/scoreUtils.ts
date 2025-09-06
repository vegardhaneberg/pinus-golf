import type { CompleteRound } from "../supabase/supabaseClient";
import type { HoleScore } from "../types/types";

export const calculateTotal = (scores: number[]): number => {
  return scores.reduce((accumulator, current) => accumulator + current, 0);
};

export const calculateTotalPar = (scores: HoleScore[]): number => {
  return scores.reduce((total, score) => total + score.par, 0);
};

export const formatScoreRelativeToPar = (
  totalScore: number,
  totalPar: number
): string => {
  const difference = totalScore - totalPar;
  if (difference === 0) return "På par";
  if (difference > 0) return `+${difference}`;
  return `${difference}`;
};

export const getAverageScore = (rounds: CompleteRound[]): number => {
  if (rounds.length === 0) return 0;
  const totalScore = rounds.reduce((sum, round) => {
    const roundScore =
      round.first_hole +
      round.second_hole +
      round.third_hole +
      round.fourth_hole +
      round.fifth_hole;
    return sum + roundScore;
  }, 0);

  const average = totalScore / rounds.length;
  return Math.round(average * 10) / 10;
};

export const findBestRound = (rounds: CompleteRound[]): number => {
  if (rounds.length === 0) return 0;

  const bestRound = rounds.reduce((best, current) => {
    const bestScore =
      best.first_hole +
      best.second_hole +
      best.third_hole +
      best.fourth_hole +
      best.fifth_hole;

    const currentScore =
      current.first_hole +
      current.second_hole +
      current.third_hole +
      current.fourth_hole +
      current.fifth_hole;

    return currentScore < bestScore ? current : best;
  });

  return (
    bestRound.first_hole +
    bestRound.second_hole +
    bestRound.third_hole +
    bestRound.fourth_hole +
    bestRound.fifth_hole
  );
};

export interface PlayerStatistics {
  AverageRound: CompleteRound;
  BestRound: CompleteRound;
  ParPercentageRound: CompleteRound;
}

export const getPlayerStatistics = (
  rounds: CompleteRound[],
  playerId: number
): PlayerStatistics => {
  const averages = calculateHoleAverages(rounds);
  const bests = findBestResultsPerHole(rounds);
  const precentageRound = calculateHolePercentages(rounds);
  return {
    AverageRound: {
      id: 9999999,
      first_hole: averages[0],
      second_hole: averages[1],
      third_hole: averages[2],
      fourth_hole: averages[3],
      fifth_hole: averages[4],
      player_id: playerId,
      created_at: "not used",
    },
    BestRound: {
      id: 1111111,
      first_hole: bests[0],
      second_hole: bests[1],
      third_hole: bests[2],
      fourth_hole: bests[3],
      fifth_hole: bests[4],
      player_id: playerId,
      created_at: "not used",
    },
    ParPercentageRound: {
      id: 1111111,
      first_hole: precentageRound[0],
      second_hole: precentageRound[1],
      third_hole: precentageRound[2],
      fourth_hole: precentageRound[3],
      fifth_hole: precentageRound[4],
      player_id: playerId,
      created_at: "not used",
    },
  };
};

const calculateHoleAverages = (rounds: CompleteRound[]): number[] => {
  if (rounds.length === 0) return [0, 0, 0, 0, 0];

  const holeTotals = [0, 0, 0, 0, 0];

  for (const round of rounds) {
    holeTotals[0] += round.first_hole;
    holeTotals[1] += round.second_hole;
    holeTotals[2] += round.third_hole;
    holeTotals[3] += round.fourth_hole;
    holeTotals[4] += round.fifth_hole;
  }

  return holeTotals.map(
    (total) => Math.round((total / rounds.length) * 10) / 10
  );
};

const findBestResultsPerHole = (rounds: CompleteRound[]): number[] => {
  if (rounds.length === 0) return [0, 0, 0, 0, 0];

  // Initialize best results with Infinity so any real score will be lower
  const bestResults = [Infinity, Infinity, Infinity, Infinity, Infinity];

  for (const round of rounds) {
    bestResults[0] = Math.min(bestResults[0], round.first_hole);
    bestResults[1] = Math.min(bestResults[1], round.second_hole);
    bestResults[2] = Math.min(bestResults[2], round.third_hole);
    bestResults[3] = Math.min(bestResults[3], round.fourth_hole);
    bestResults[4] = Math.min(bestResults[4], round.fifth_hole);
  }

  return bestResults;
};

const calculateHolePercentages = (rounds: CompleteRound[]): number[] => {
  if (rounds.length === 0) return [0, 0, 0, 0, 0];

  const counts = [0, 0, 0, 0, 0];

  for (const round of rounds) {
    if (round.first_hole <= 3) counts[0]++;
    if (round.second_hole <= 3) counts[1]++;
    if (round.third_hole <= 3) counts[2]++;
    if (round.fourth_hole <= 3) counts[3]++;
    if (round.fifth_hole <= 3) counts[4]++;
  }

  return counts.map((count) => Math.round((count / rounds.length) * 100));
};
