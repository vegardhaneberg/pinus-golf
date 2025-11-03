import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import type { Database } from "./database.types";
import type { HoleStatistics, RoundAttempt } from "../types/types";

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
  const { data, error } = await supabase.from("Player").select("*").order("id");

  if (error) {
    console.error("Error fetching Players: ", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPlayer(playerId: number): Promise<Player | undefined> {
  const { data, error } = await supabase
    .from("Player")
    .select("*")
    .eq("id", playerId)
    .single();

  if (error) {
    console.error("Error getting player with id:", playerId);
    return;
  }

  return data;
}

export async function getHoleStatistics(): Promise<HoleStatistics | null> {
  const completeRoundsWithPlayerData = await getAllRoundsWithPlayerData();
  if (
    !completeRoundsWithPlayerData ||
    completeRoundsWithPlayerData.length < 1
  ) {
    return null;
  }
  const avgFirstHole =
    completeRoundsWithPlayerData.reduce(
      (sum, round) => sum + round.first_hole,
      0
    ) / completeRoundsWithPlayerData.length;

  const playersWithHoleInOne = [
    ...new Set(
      completeRoundsWithPlayerData
        .filter((round) => round.first_hole === 1)
        .map((round) => round!.player!.name)
    ),
  ];

  const totalAttempts = completeRoundsWithPlayerData.length;

  const totalHoleInOnes = completeRoundsWithPlayerData.reduce(
    (count, round) => {
      const holes = [
        round.first_hole,
        round.second_hole,
        round.third_hole,
        round.fourth_hole,
        round.fifth_hole,
      ];
      return count + holes.filter((score) => score === 1).length;
    },
    0
  );

  return {
    averageStrokes: avgFirstHole,
    numberOfAttempts: totalAttempts,
    numberOfHoleInOnes: totalHoleInOnes,
    playersWithHoleInOne: playersWithHoleInOne,
  };
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

export async function getRoundsForPlayer(
  playerId: number
): Promise<CompleteRound[]> {
  const { data, error } = await supabase
    .from("CompleteRound")
    .select(
      `
      id, created_at, first_hole, second_hole, third_hole, fourth_hole, fifth_hole, player_id
    `
    )
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching rounds for player:", error.message);
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
    .slice(0, 5);
}

export async function savePlayer(
  name: string,
  imageUrl: string | null
): Promise<Player | undefined> {
  const { data: playerRow, error: playerErr } = await supabase
    .from("Player")
    .upsert({ name: name, image_url: imageUrl })
    .select("id, name")
    .single();

  if (playerErr || !playerRow) {
    console.error(playerErr?.message ?? "Failed to upsert/find player");
    return;
  }

  return {
    id: playerRow.id,
    name: playerRow.name,
  };
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

export const getHoleScore = (
  round: CompleteRoundWithPlayer,
  holeNumber: number
): number => {
  switch (holeNumber) {
    case 1:
      return round.first_hole;
    case 2:
      return round.second_hole;
    case 3:
      return round.third_hole;
    case 4:
      return round.fourth_hole;
    case 5:
      return round.fifth_hole;
    default:
      return 0;
  }
};

const bucketName = "players";

export const uploadImage = async (
  file: File,
  opts?: { playerName?: string }
): Promise<string> => {
  const ext = file.name.split(".").pop() || "jpg";
  const safeName =
    (opts?.playerName ?? "player")
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-") || "player";

  const objectPath = `players/${safeName}/${uuidv4()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(objectPath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("players").getPublicUrl(objectPath);
  return publicUrl;
};

export interface Highlight {
  id: number;
  title: string;
  intro: string;
  date: Date;
  roundIds: number[];
  blocks: HighlightBlock[];
}

export interface HighlightBlock {
  subtitle: string;
  text: string;
}

export const Highlights: Highlight[] = [
  {
    id: 1,
    title: "Pinus golf open 2025",
    date: new Date("2025-01-01"),
    roundIds: [89, 76, 80],
    intro:
      "Da var det igjen duket for Pinus Golf Open 2025. Flott vær så alt lå til rette for en herlig runde med golf",
    blocks: [
      {
        subtitle: "Kolsåstoppen",
        text: "Helene slo meget godt ut, og etter litt trøbling med putten endte hun på par. Vegard starter i kjent stil med en boogey på Pinus Golf Open 2025. Første stikk til Helene.",
      },
      {
        subtitle: "Kløfta",
        text: "Usedvanlig godt utslag på Vegard og han ender med en birdie. Helene fortsetter på par.",
      },
      {
        subtitle: "Månetoppen",
        text: "Her treffer man jo alltid stein og det gjør både Vegard og Helene",
      },
    ],
  },
  {
    id: 2,
    title: "Solorunde på Vegard",
    roundIds: [87, 88],
    intro:
      "Vegard startet årets dugnadshelg med en liten sylfrekk solorunde på golfbanen.",
    date: new Date("2025-01-02"),
    blocks: [
      {
        subtitle: "Stang ut og stang ut",
        text: "skulle ikke lykkes denne gangen heller. Startet stang ut med en fryyyktelig putt på første hull og fortsatte i samme baner resten av runden. RIP!",
      },
    ],
  },
];
