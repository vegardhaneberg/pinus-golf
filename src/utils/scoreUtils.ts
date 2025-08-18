import type { Round, HoleScore } from '../types';

export const calculateTotal = (scores: HoleScore[]): number => {
  return scores.reduce((total, score) => total + score.score, 0);
};

export const calculateTotalPar = (scores: HoleScore[]): number => {
  return scores.reduce((total, score) => total + score.par, 0);
};

export const formatScoreRelativeToPar = (totalScore: number, totalPar: number): string => {
  const difference = totalScore - totalPar;
  if (difference === 0) return 'Even';
  if (difference > 0) return `+${difference}`;
  return `${difference}`;
};

export const sortRoundsByScore = (rounds: Round[]): Round[] => {
  return [...rounds].sort((a, b) => a.totalScore - b.totalScore);
};

export const sortRoundsByDate = (rounds: Round[]): Round[] => {
  return [...rounds].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};