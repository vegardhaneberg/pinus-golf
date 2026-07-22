import React, { useMemo, useState } from "react";
import { formatScoreRelativeToPar } from "../utils/scoreUtils";
import {
  calculateRoundScore,
  formatDate,
  getAvailableYears,
  getBestRoundsForYear,
  type CompleteRoundWithPlayer,
} from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChampionIcon,
  MedalFirstPlaceIcon,
  MedalSecondPlaceIcon,
  MedalThirdPlaceIcon,
} from "@hugeicons/core-free-icons";

interface TopScoresProps {
  rounds: CompleteRoundWithPlayer[];
}

const PAR = 15;

const rankCardStyle = (rank: number): string => {
  if (rank === 1)
    return "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 hover:border-yellow-300";
  if (rank === 2)
    return "bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 hover:border-gray-300";
  if (rank === 3)
    return "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 hover:border-orange-300";
  return "bg-gray-50 border border-gray-100 hover:bg-green-50 hover:border-green-200";
};

const TopScores: React.FC<TopScoresProps> = ({ rounds }) => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const availableYears = useMemo(() => getAvailableYears(rounds), [rounds]);
  const bestRoundsForYear = useMemo(
    () => getBestRoundsForYear(rounds, selectedYear),
    [rounds, selectedYear]
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <HugeiconsIcon
            icon={MedalFirstPlaceIcon}
            size={28}
            color="#eab308"
            strokeWidth={1.5}
          />
        );
      case 2:
        return (
          <HugeiconsIcon
            icon={MedalSecondPlaceIcon}
            size={24}
            color="#94a3b8"
            strokeWidth={1.5}
          />
        );
      case 3:
        return (
          <HugeiconsIcon
            icon={MedalThirdPlaceIcon}
            size={24}
            color="#cd7f32"
            strokeWidth={1.5}
          />
        );
      default:
        return (
          <div className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-bold">
            {rank}
          </div>
        );
    }
  };

  const navigateToTournament = (round: CompleteRoundWithPlayer) => {
    navigate(`/tournament/${round.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
        <HugeiconsIcon
          icon={ChampionIcon}
          size={24}
          color="#16a34a"
          strokeWidth={1.5}
        />
        Årsbeste {selectedYear}
      </h2>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {availableYears.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              year === selectedYear
                ? "bg-green-600 text-white"
                : "bg-green-50 text-green-800 hover:bg-green-100"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {bestRoundsForYear.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <HugeiconsIcon
            icon={ChampionIcon}
            size={48}
            color="#9ca3af"
            strokeWidth={1.5}
          />
          <p className="mt-2">Ingen resultater i {selectedYear} ennå</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bestRoundsForYear.map((round, index) => {
            const rank = index + 1;
            const score = calculateRoundScore(round);
            const diff = score - PAR;
            return (
              <div
                key={round.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${rankCardStyle(rank)}`}
                onClick={() => navigateToTournament(round)}
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">{getRankIcon(rank)}</div>
                  {round.player?.image_url && (
                    <img
                      src={round.player.image_url}
                      alt={round.player?.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-green-200 shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  )}
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {round.player?.name ?? "Ukjent spiller"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(round.created_at)}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-bold ${rank === 1 ? "text-2xl text-yellow-600" : "text-xl text-green-800"}`}
                  >
                    {score}
                  </div>
                  <div
                    className={`text-xs font-medium ${diff < 0 ? "text-green-600" : diff === 0 ? "text-blue-600" : "text-gray-500"}`}
                  >
                    {formatScoreRelativeToPar(score, PAR)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopScores;
