import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, TrendingUp, Home, Plus } from "lucide-react";
import {
  formatDate,
  getAllPlayers,
  getRoundsForPlayer,
  savePlayer,
  uploadImage,
  type CompleteRound,
  type Player,
} from "../supabase/supabaseClient";
import { getPlayerOverviewStatistics } from "../utils/scoreUtils";
import RegisterPlayerModal from "../components/RegisterPlayerModal";

type RoundsByPlayer = Record<number, CompleteRound[]>;

const PlayersPage: React.FC = () => {
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [roundsByPlayer, setRoundsByPlayer] = useState<RoundsByPlayer>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    getAllPlayers().then((playersFromSupabase) => {
      setPlayers(playersFromSupabase);
    });
  }, []);

  useEffect(() => {
    if (players.length === 0) return;
    let cancelled = false;

    (async () => {
      try {
        const entries = await Promise.all(
          players.map(async (p) => {
            const rounds = await getRoundsForPlayer(p.id);
            return [p.id, rounds] as const;
          })
        );

        if (!cancelled) {
          setRoundsByPlayer(Object.fromEntries(entries));
        }
      } catch (err) {
        console.error("Failed to load rounds for players:", err);
      }
    })();

    return () => {
      cancelled = true; // avoid setState after unmount
    };
  }, [players]);

  const handleRegisterPlayer = (playerName: string, image: File | null) => {
    console.log("Player name:", playerName);

    if (image) {
      console.log("Image file:", image.name, image.size, image.type);

      uploadImage(image, { playerName: playerName }).then(
        (supabaseImageUrl) => {
          savePlayer(playerName, supabaseImageUrl);
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-green-50 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-green-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-green-800">Spillere</h1>
                <p className="text-green-600">Alle registrerte golfere</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Legg til spiller
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Players Grid */}
        {players.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Vi fant ingen registrerte spillere
            </h3>
            <p className="text-gray-600 mb-6">
              Registrer en runde for å dukke opp her
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
            >
              <Home className="w-5 h-5" />
              Tilbake
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {players.map((player) => {
              const playerOverviewStats = getPlayerOverviewStatistics(
                roundsByPlayer[player.id]
              );

              return (
                <div
                  key={player.id}
                  onClick={() => navigate(`/player/${player.id}`)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  {/* Player Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={player.image_url}
                      alt={player.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = "/players/default.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Player Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-green-800 mb-2 group-hover:text-green-600 transition-colors">
                      {player.name}
                    </h3>

                    {/* Performance Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {playerOverviewStats.handicap < 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          playerOverviewStats.handicap < 10
                            ? "text-green-600"
                            : playerOverviewStats.handicap === 0
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {playerOverviewStats.handicap === 0
                          ? " - "
                          : playerOverviewStats.handicap > 0
                          ? `+${playerOverviewStats.handicap}`
                          : `${playerOverviewStats.handicap}`}
                        {"\u00A0"}
                        Handicap
                      </span>
                    </div>

                    {/* Additional Stats */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Runder:</span>
                        <span className="font-semibold">
                          {playerOverviewStats.roundCount}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>Gjennomsnitt:</span>
                        <span className="font-semibold">
                          {playerOverviewStats.average}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>Forrige runde:</span>
                        <span className="font-semibold">
                          {playerOverviewStats.lastPlayed !== "-"
                            ? formatDate(playerOverviewStats.lastPlayed)
                            : "-"}
                        </span>
                      </div>
                    </div>

                    {/* View Profile Button */}
                    <div className="mt-4 opacity-100">
                      <div className="bg-green-600 text-white text-center py-2 rounded-lg text-sm font-semibold">
                        Se profil
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Register Player Modal */}
      <RegisterPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRegisterPlayer}
      />
    </div>
  );
};

export default PlayersPage;
