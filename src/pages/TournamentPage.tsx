import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const returnPath = searchParams.get("returnPath");

  useEffect(() => {
    (async () => {
      const supabaseRound = await getRoundWithPlayerData(roundId);
      setRound(supabaseRound);
    })();
  }, [roundId]);

  const navigateHome = () => {
    if (returnPath) {
      navigate(returnPath);
    } else {
      navigate("/");
    }
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
            {/* Player header */}
            <div className="flex items-center gap-4 mb-6">
              {round.player?.image_url && (
                <img
                  src={round.player.image_url}
                  alt={round.player.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-green-200"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div>
                <h2
                  className="text-xl font-bold text-green-800 cursor-pointer hover:underline"
                  onClick={() => navigateToPlayerPage()}
                >
                  {round.player?.name ?? "Ukjent"}
                </h2>
                <p className="text-sm text-gray-500">{formatDate(round.created_at)}</p>
              </div>
              <div className="ml-auto text-right">
                <div className={`text-3xl font-bold ${calculateRoundScore(round) < 15 ? "text-green-600" : calculateRoundScore(round) === 15 ? "text-blue-600" : "text-red-600"}`}>
                  {calculateRoundScore(round)}
                </div>
                <div className="text-sm text-gray-500">slag totalt</div>
              </div>
            </div>

            {/* Hole-by-hole score grid */}
            <div className="flex justify-center gap-3 sm:gap-6 mb-8">
              {[
                { hole: COURSE.holes[0], score: round.first_hole },
                { hole: COURSE.holes[1], score: round.second_hole },
                { hole: COURSE.holes[2], score: round.third_hole },
                { hole: COURSE.holes[3], score: round.fourth_hole },
                { hole: COURSE.holes[4], score: round.fifth_hole },
              ].map(({ hole, score }) => {
                const diff = score - hole.par;
                const bg =
                  score === 1
                    ? "bg-yellow-400 text-white"
                    : diff < 0
                    ? "bg-green-500 text-white"
                    : diff === 0
                    ? "bg-blue-100 text-blue-800"
                    : diff === 1
                    ? "bg-amber-400 text-white"
                    : "bg-red-500 text-white";
                return (
                  <div key={hole.number} className="flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-500 font-medium hidden sm:block text-center leading-tight max-w-14">
                      {hole.name}
                    </div>
                    <div className="text-xs text-gray-400 sm:hidden">
                      Hull {hole.number}
                    </div>
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${bg}`}
                    >
                      {score}
                    </div>
                    <div className="text-xs text-gray-400">
                      {diff === 0 ? "Par" : diff > 0 ? `+${diff}` : diff}
                    </div>
                  </div>
                );
              })}
            </div>

            <RoundChart par={3} round={round} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentPage;
