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

// export const sortRoundsByScore = (rounds: Round[]): Round[] => {
//   return [...rounds].sort((a, b) => a.totalScore - b.totalScore);
// };
