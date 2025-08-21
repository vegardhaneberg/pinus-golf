import React from "react";
import { Calendar, User } from "lucide-react";
import { formatScoreRelativeToPar } from "../utils/scoreUtils";
import {
  calculateRoundScore,
  formatDate,
  type CompleteRoundWithPlayer,
} from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

interface RecentResultsProps {
  rounds: CompleteRoundWithPlayer[];
}

const RecentResults: React.FC<RecentResultsProps> = ({ rounds }) => {
  const navigate = useNavigate();

  const handleOnClick = (round: CompleteRoundWithPlayer) => {
    navigate(`/tournament/${round.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Nylige resultater
      </h2>

      {rounds.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Ingen registrerte runder</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rounds.map((round, index) => (
            <div
              key={round.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => handleOnClick(round)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-800">
                      {round.player?.name ?? "ukjent spiller"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(round.created_at)}
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

export default RecentResults;
