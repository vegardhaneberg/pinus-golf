import React from "react";
import { formatScoreRelativeToPar } from "../utils/scoreUtils";
import {
  calculateRoundScore,
  formatDate,
  type CompleteRoundWithPlayer,
} from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";

interface RecentResultsProps {
  rounds: CompleteRoundWithPlayer[];
}

const PAR = 15;

const scoreColor = (score: number): string => {
  if (score < PAR) return "text-green-600";
  if (score === PAR) return "text-blue-600";
  return "text-red-600";
};

const RecentResults: React.FC<RecentResultsProps> = ({ rounds }) => {
  const navigate = useNavigate();

  const handleOnClick = (round: CompleteRoundWithPlayer) => {
    navigate(`/tournament/${round.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <HugeiconsIcon
          icon={Calendar03Icon}
          size={24}
          color="#16a34a"
          strokeWidth={1.5}
        />
        Nylige resultater
      </h2>

      {rounds.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <HugeiconsIcon
            icon={Calendar03Icon}
            size={48}
            color="#9ca3af"
            strokeWidth={1.5}
          />
          <p className="mt-2">Ingen registrerte runder</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map((round, index) => {
            const score = calculateRoundScore(round);
            return (
              <div
                key={round.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-green-50 border border-transparent hover:border-green-200 transition-colors cursor-pointer"
                onClick={() => handleOnClick(round)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    {index + 1}
                  </div>
                  {round.player?.image_url ? (
                    <img
                      src={round.player.image_url}
                      alt={round.player.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-green-200 shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <span className="text-green-800 font-bold text-sm">
                        {round.player?.name?.charAt(0) ?? "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {round.player?.name ?? "ukjent spiller"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(round.created_at)}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-xl font-bold ${scoreColor(score)}`}>
                    {score}
                  </div>
                  <div className={`text-xs font-medium ${scoreColor(score)}`}>
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

export default RecentResults;
