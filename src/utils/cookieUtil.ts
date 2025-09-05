import Cookies from "js-cookie";
import type { RoundAttempt } from "../types/types";

const cookieName = "currentRound";

export const setRoundCookie = (
  roundAttempt: RoundAttempt
): string | undefined => {
  return Cookies.set(cookieName, JSON.stringify(roundAttempt));
};

export const getRoundCookie = (): RoundAttempt | null => {
  const currentRound = Cookies.get(cookieName);
  if (currentRound === null || currentRound === undefined) {
    return null;
  }
  const roundAttempt = JSON.parse(currentRound);
  return roundAttempt as RoundAttempt;
};
