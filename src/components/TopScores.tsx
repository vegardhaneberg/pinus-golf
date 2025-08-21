import React from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { formatScoreRelativeToPar } from "../utils/scoreUtils";
import {
  calculateRoundScore,
  type CompleteRoundWithPlayer,
} from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

interface TopScoresProps {
  rounds: CompleteRoundWithPlayer[];
}

const TopScores: React.FC<TopScoresProps> = ({ rounds }) => {
  const navigate = useNavigate();
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-bold">
            {rank}
          </div>
        );
    }
  };

  const getRankBorder = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-l-4 border-yellow-500";
      case 2:
        return "border-l-4 border-gray-400";
      case 3:
        return "border-l-4 border-amber-600";
      default:
        return "border-l-4 border-green-500";
    }
  };

  const navigateToTournament = (round: CompleteRoundWithPlayer) => {
    navigate(`/tournament/${round.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6" />
        Gjennom tidene
      </h2>

      {rounds.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No scores to display yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map((round, index) => (
            <div
              key={round.id}
              className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${getRankBorder(
                index + 1
              )}`}
              onClick={() => navigateToTournament(round)}
            >
              <div className="flex items-center gap-3">
                {getRankIcon(index + 1)}
                <div>
                  <div className="font-semibold text-gray-800">
                    {round.player?.name ?? "feil ved lasting av spiller"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(round.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-green-800">
                  {calculateRoundScore(round)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatScoreRelativeToPar(calculateRoundScore(round), 15)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopScores;
