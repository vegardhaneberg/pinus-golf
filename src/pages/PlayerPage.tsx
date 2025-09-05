import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getLast20RoundsForPlayer,
  getPlayer,
  type CompleteRound,
  type Player,
} from "../supabase/supabaseClient";
import { calculateHandicap } from "../utils/handicapUtil";
import { ArrowLeft } from "lucide-react";

const PlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const playerIdFromPath = parseInt(id || "1");

  const [last20Rounds, setLast20Rounds] = useState<CompleteRound[]>([]);
  const [player, setPlayer] = useState<Player | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    getLast20RoundsForPlayer(playerIdFromPath).then((lastRounds) => {
      setLast20Rounds(lastRounds);
      getPlayer(playerIdFromPath).then((player) => {
        setPlayer(player);
        setIsLoading(false);
      });
    });
  }, [playerIdFromPath]);

  const navigateHome = () => {
    navigate("/");
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="cursor-pointer" onClick={navigateHome}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/")}
                    className="p-2 hover:bg-green-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6 text-green-600" />
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold text-green-800">
                      {player?.name ?? "Her gikk det galt!"}
                    </h1>
                    <p className="text-green-600">Profil</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            {player && last20Rounds ? (
              <div>
                <h2 className="text-xl font-bold text-green-800 mb-4">
                  Handicap
                </h2>
                <p className="font-semibold text-gray-800 mb-4">
                  {calculateHandicap(last20Rounds) ?? "ikke spilt nok runder"}
                </p>
              </div>
            ) : (
              <div>
                {isLoading ? "" : "Gå tilbake ved å klikke på pilen over"}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerPage;
