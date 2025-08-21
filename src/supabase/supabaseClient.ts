import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { RoundAttempt } from "../types/types";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export type CompleteRound =
  Database["public"]["Tables"]["CompleteRound"]["Row"];
export type Player = Database["public"]["Tables"]["Player"]["Row"];
export type PlayerInsert = Database["public"]["Tables"]["Player"]["Insert"];
export type CompleteRoundInsert =
  Database["public"]["Tables"]["CompleteRound"]["Insert"];
export type CompleteRoundWithPlayer = CompleteRound & {
  player: Pick<Player, "id" | "name"> | null;
};

export async function getAllPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("Player")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching Players: ", error.message);
    return [];
  }
  return data ?? [];
}

export async function getRoundWithPlayerData(
  id: number
): Promise<CompleteRoundWithPlayer> {
  const { data, error } = await supabase
    .from("CompleteRound")
    .select(
      `
      id, created_at, first_hole, second_hole, third_hole, fourth_hole, fifth_hole, player_id,
      player:player_id ( id, name )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching rounds with player:", error.message);
    throw new Error("Could not find round");
  }

  return data;
}

export async function getAllRoundsWithPlayerData(): Promise<
  CompleteRoundWithPlayer[]
> {
  const { data, error } = await supabase
    .from("CompleteRound")
    .select(
      `
      id, created_at, first_hole, second_hole, third_hole, fourth_hole, fifth_hole, player_id,
      player:player_id ( id, name )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching rounds with player:", error.message);
    return [];
  }
  return data ?? [];
}

export function calculateRoundScore(round: CompleteRoundWithPlayer): number {
  return (
    round.first_hole +
    round.second_hole +
    round.third_hole +
    round.fourth_hole +
    round.fifth_hole
  );
}

export function getFiveBestRounds(
  rounds: CompleteRoundWithPlayer[]
): CompleteRoundWithPlayer[] {
  return [...rounds]
    .sort((a, b) => calculateRoundScore(a) - calculateRoundScore(b))
    .slice(0, 3);
}

export async function saveRoundAttempt(
  newRound: RoundAttempt
): Promise<boolean> {
  const { data: playerRow, error: playerErr } = await supabase
    .from("Player")
    .upsert(newRound.player!)
    .select("id, name")
    .single();

  if (playerErr || !playerRow) {
    console.error(playerErr?.message ?? "Failed to upsert/find player");
    return false;
  }

  const completeRoundPayload: CompleteRoundInsert = {
    first_hole: newRound.hole1,
    second_hole: newRound.hole2,
    third_hole: newRound.hole3,
    fourth_hole: newRound.hole4,
    fifth_hole: newRound.hole5,
    player_id: playerRow.id,
  };

  const { data: insertedRound, error: insertedRoundErr } = await supabase
    .from("CompleteRound")
    .insert(completeRoundPayload)
    .select("*")
    .single();

  if (insertedRoundErr || !insertedRound) {
    console.error(
      insertedRoundErr?.message ?? "Failed to insert CompleteRound"
    );
    return false;
  }

  return true;
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
