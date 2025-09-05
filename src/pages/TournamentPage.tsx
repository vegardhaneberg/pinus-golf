import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  calculateRoundScore,
  type CompleteRoundWithPlayer,
  formatDate,
  getRoundWithPlayerData,
} from "../supabase/supabaseClient";
import { ArrowLeft } from "lucide-react";
import { COURSE } from "../data/course";
import RoundChart from "../components/RoundChart";

const TournamentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const roundId = Number(id);
  const [round, setRound] = useState<CompleteRoundWithPlayer>();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const supabaseRound = await getRoundWithPlayerData(roundId);
      setRound(supabaseRound);
    })();
  }, [roundId]);

  const navigateHome = () => {
    navigate("/");
  };

  const navigateToPlayerPage = () => {
    navigate(`/player/${round?.player_id}`);
  };

  return (
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
                    {COURSE.name}
                  </h1>
                  <p className="text-green-600">5 hull én mester</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {round && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2
              className="text-xl font-bold text-green-800 mb-4 cursor-pointer no-underline hover:underline"
              onClick={() => navigateToPlayerPage()}
            >
              {round.player?.name ?? "Ukjent"}
            </h2>
            <p className="font-semibold text-gray-800 mb-4">
              {formatDate(round.created_at) +
                " spilte " +
                round.player?.name +
                " til "}
              <span className="text-green-600">
                {calculateRoundScore(round) + " slag"}
              </span>
            </p>

            {round && <RoundChart par={3} round={round} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentPage;
