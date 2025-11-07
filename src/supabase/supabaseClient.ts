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
  imageUrl: string
): Promise<Player | undefined> {
  const { data: playerRow, error: playerErr } = await supabase
    .from("Player")
    .upsert({ name: name, image_url: imageUrl })
    .select("id, name, image_url")
    .single();

  if (playerErr || !playerRow) {
    console.error(playerErr?.message ?? "Failed to upsert/find player");
    return;
  }

  return {
    id: playerRow.id,
    name: playerRow.name,
    image_url: playerRow.image_url,
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

  const objectPath = `${safeName}-${uuidv4()}.${ext}`;

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
  } = supabase.storage.from(bucketName).getPublicUrl(objectPath);
  return publicUrl;
};

export const deletePlayerAndAssets = async (
  playerId: number
): Promise<boolean> => {
  // Load player to get image URL
  const { data: playerRow, error: playerErr } = await supabase
    .from("Player")
    .select("id, image_url")
    .eq("id", playerId)
    .single();

  if (playerErr) {
    console.error("Failed to load player before delete:", playerErr.message);
    return false;
  }

  // Best-effort delete of image from storage (ignore errors, but log)
  if (playerRow?.image_url) {
    try {
      // Public URL format: https://<proj>.supabase.co/storage/v1/object/public/players/<objectKey>
      const idx = playerRow.image_url.indexOf("/players/");
      if (idx !== -1) {
        const objectKey = playerRow.image_url.substring(
          idx + "/players/".length
        );
        const { error: storageErr } = await supabase.storage
          .from(bucketName)
          .remove([objectKey]);
        if (storageErr) {
          console.error("Failed to delete player image:", storageErr.message);
        }
      }
    } catch (e) {
      console.error("Unexpected error deleting image:", e);
    }
  }

  // Delete dependent rows first to satisfy FK constraints
  const { error: deleteRoundsErr } = await supabase
    .from("CompleteRound")
    .delete()
    .eq("player_id", playerId);
  if (deleteRoundsErr) {
    console.error("Failed to delete player's rounds:", deleteRoundsErr.message);
    return false;
  }

  // Finally delete player
  const { error: deletePlayerErr } = await supabase
    .from("Player")
    .delete()
    .eq("id", playerId);
  if (deletePlayerErr) {
    console.error("Failed to delete player:", deletePlayerErr.message);
    return false;
  }

  return true;
};

export interface Highlight {
  id: number;
  title: string;
  intro: string;
  date: Date;
  rounds: HighlightRound[];
  image: string;
  blocks: HighlightBlock[];
}

export interface HighlightRound {
  teamName: string;
  strokes: number[];
}
export interface HighlightBlock {
  subtitle: string;
  text: string;
}

export const Highlights: Highlight[] = [
  {
    id: 1,
    title: "Pinus Golf Open",
    date: new Date("2025-01-01"),
    rounds: [
      {
        teamName: "Helene",
        strokes: [3, 5, 3, 2, 3],
      },
      {
        teamName: "Vegard",
        strokes: [5, 3, 4, 3, 3],
      },
    ],
    image: "/pinus-golf-course.jpg",
    intro:
      "Da var det igjen duket for Pinus Golf Open 2025. Flott vær og alt lå til rette for en herlig runde med golf",
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
    rounds: [
      {
        teamName: "Vegard",
        strokes: [4, 5, 4, 3, 4],
      },
      {
        teamName: "Vegard 2",
        strokes: [4, 3, 4, 3, 2],
      },
      {
        teamName: "Vegard 3",
        strokes: [2, 3, 4, 3, 3],
      },
      {
        teamName: "Vegard 4",
        strokes: [3, 3, 4, 3, 5],
      },
      {
        teamName: "Vegard 5",
        strokes: [3, 3, 4, 4, 4],
      },
      {
        teamName: "Vegard 6",
        strokes: [3, 5, 7, 4, 4],
      },
      {
        teamName: "Vegard 7",
        strokes: [2, 2, 3, 2, 3],
      },
    ],
    image: "/solo-vegard.jpg",
    intro:
      "Vegard startet årets dugnadshelg med en liten sylfrekk solorunde på golfbanen.",
    date: new Date("2025-01-02"),
    blocks: [
      {
        subtitle: "Stang ut og stang ut",
        text: "Vegard fortsetter jakten på årsbeste på Pinus Golfbane for 2025, men det skulle ikke lykkes denne gangen heller. Startet stang ut med en fryyyktelig putt på første hull og fortsatte i samme baner resten av runden. Bildet over viser en tydelig frustrert Vegard spille seg inn fra en seig posisjon langt ute i røffen. RIP!",
      },
    ],
  },
  {
    id: 3,
    title: "Helgen Games 2025",
    date: new Date("2025-06-10"),
    rounds: [
      {
        teamName: "Norrunther",
        strokes: [2, 3, 2, 2, 3],
      },
      {
        teamName: "Tellstrøm",
        strokes: [4, 3, 2, 2, 2],
      },
    ],
    image: "/helgen-games-2025.jpg",
    intro:
      "Året er 2025 og Helgen Games er som alltid tilbake på Hvaler! Etter tap i både quiz og volleyball hadde Norrunther kniven på stupen før årets parterrenggolf braket løs!",
    blocks: [
      {
        subtitle: "Kolsåstoppen",
        text: 'Frikk og Vegard startet ballet for lag Tellstrøm. Vegard hadde gått ekstremt høyt ut i forkant av øvelsen og skrytt i både tide og utide om han nylig ervervede "Veien til golf"-kurs. Lite så vi til kurs-skillsa og han bidro sterkt til en svak start med boogey (+1) på første hull for Tellstrøm. Fra lag Norrunther var Vegard og Kristin rolige som skjøra på tunet og spilte inn en solid birdie (-1) fra Kolsåstoppen. Første stikk til Norrunther.',
      },
      {
        subtitle: "Kløfta",
        text: "Fra Kløfta var det dags for Martin, Amanda og rookien XXX. XXX viste ingen tegn til at dette var hans første deltagelse i parterrenggolf og trioen sikret par på andre hull. Tellstrøm fulgte opp med Signe, Matty og Hedda, og også de spilte sikkert inn på par. Status quo etter Kløfta...",
      },
      {
        subtitle: "Månetoppen",
        text: "Så var det dags for Frikk og Tellef fra Månetoppen. Frikk slår ut, mens Tellef er korrigør. Duoen gjør det meget solid og holder Tellstrøm inne i kampen om seieren.",
      },
      {
        subtitle: "Amsterdam",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      },
      {
        subtitle: "Steinkjer",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      },
      {
        subtitle: "Oppsummering",
        text: "Etter at Norrunther sikret seg en solid ledelse allerede fra Kolsåstoppen så det ut til at årets parterrenggolf skulle bli plankekjøring. Men de maktet ikke å øke ledelsen, som gjorde at spenningen til en viss grad var tilstede helt til Steinkjer. Etter at Vegard og Kristin holdt både hodet og svingen kaldt på banens siste hull ble det likevel en relativt komfortabel seier, og med det stiger spenningen i sammendraget i Helgen Games 2025!",
      },
    ],
  },
];
