import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRoundsForPlayer,
  getPlayer,
  deletePlayerAndAssets,
  type CompleteRound,
  type Player,
  formatDate,
  calculateRoundScoreWithoutPlayerData,
} from "../supabase/supabaseClient";
import { calculateHandicap } from "../utils/handicapUtil";
import { ArrowLeft, Plus } from "lucide-react";
import { COURSE } from "../data/course";
import {
  convertToCommaDecimal,
  findBestRound,
  getAverageScore,
  getPlayerStatistics,
  type PlayerStatistics,
} from "../utils/scoreUtils";
import { useIsMobile } from "../utils/mobileUtil";

const PlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const playerIdFromPath = parseInt(id || "1");
  const isMobile = useIsMobile();
  const [roundDisplayCount, setRoundDisplayCount] = useState<number>(10);
  const [rounds, setRounds] = useState<CompleteRound[]>([]);
  const [playerStatistics, setPlayerStatistics] = useState<
    PlayerStatistics | undefined
  >();
  const [player, setPlayer] = useState<Player | undefined>();
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const years = [2025, 2024, 2023, 2022];
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const filteredRounds = useMemo(
    () =>
      rounds
        .filter((r) => new Date(r.created_at).getFullYear() === selectedYear)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
    [rounds, selectedYear]
  );

  useEffect(() => {
    getRoundsForPlayer(playerIdFromPath).then((roundsFromSupaBase) => {
      setRounds(roundsFromSupaBase);
      const playerStats = getPlayerStatistics(
        roundsFromSupaBase,
        playerIdFromPath
      );
      setPlayerStatistics(playerStats);
      getPlayer(playerIdFromPath).then((player) => {
        setPlayer(player);
      });
    });
  }, [playerIdFromPath]);

  function handleSelectedYear(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedYear(Number(e.target.value));
    setRoundDisplayCount(10);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/players")}
              className="p-2 hover:bg-green-50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-green-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-green-800">
                Spillerprofil
              </h1>
              <p className="text-green-600">Pinus golf ™</p>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Player Info Card */}
        {player && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                <img
                  src={player?.image_url}
                  alt={player?.name ?? "999"}
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-200 shadow-lg"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = "/players/default.jpg";
                  }}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-green-800 mb-2">
                  {player?.name ?? "-"}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">
                      {calculateHandicap(rounds)
                        ? convertToCommaDecimal(calculateHandicap(rounds)!)
                        : "-"}
                    </div>
                    <div className="text-sm text-gray-600">Handicap</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">
                      {rounds.length}
                    </div>
                    <div className="text-sm text-gray-600">Runder spilt</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">
                      {convertToCommaDecimal(getAverageScore(rounds))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isMobile ? "Snitt" : "Gjennomsnitt"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">
                      {findBestRound(rounds)}
                    </div>
                    <div className="text-sm text-gray-600">Beste runde</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hole-by-Hole Performance */}
        {playerStatistics && player && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6">
              Hull-for-hull
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">
                      Hull
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-800">
                      {isMobile ? "Snitt" : "Gjennomsnitt"}
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-800">
                      Best
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-800">
                      Par Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    key="1"
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-semibold text-green-800">
                      {isMobile ? 1 : COURSE.holes[0].name}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {convertToCommaDecimal(
                        playerStatistics.AverageRound.first_hole
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-green-600">
                        {playerStatistics.BestRound.first_hole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {playerStatistics.ParPercentageRound.first_hole}%
                    </td>
                  </tr>
                  <tr
                    key="2"
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-semibold text-green-800">
                      {isMobile ? 2 : COURSE.holes[1].name}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {convertToCommaDecimal(
                        playerStatistics.AverageRound.second_hole
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-green-600">
                        {playerStatistics.BestRound.second_hole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {playerStatistics.ParPercentageRound.second_hole}%
                    </td>
                  </tr>
                  <tr
                    key="3"
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-semibold text-green-800">
                      {isMobile ? 3 : COURSE.holes[2].name}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {convertToCommaDecimal(
                        playerStatistics.AverageRound.third_hole
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-green-600">
                        {playerStatistics.BestRound.third_hole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {playerStatistics.ParPercentageRound.third_hole}%
                    </td>
                  </tr>
                  <tr
                    key="4"
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-semibold text-green-800">
                      {isMobile ? 4 : COURSE.holes[3].name}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {convertToCommaDecimal(
                        playerStatistics.AverageRound.fourth_hole
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-green-600">
                        {playerStatistics.BestRound.fourth_hole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {playerStatistics.ParPercentageRound.fourth_hole}%
                    </td>
                  </tr>
                  <tr
                    key="5"
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-semibold text-green-800">
                      {isMobile ? 5 : COURSE.holes[4].name}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {convertToCommaDecimal(
                        playerStatistics.AverageRound.fifth_hole
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-green-600">
                        {playerStatistics.BestRound.fifth_hole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {playerStatistics.ParPercentageRound.fifth_hole}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {player && rounds.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6">
              Runder spilt i{" "}
              <select
                value={selectedYear}
                onChange={(e) => handleSelectedYear(e)}
                className="bg-transparent text-green-800 font-bold underline underline-offset-4 cursor-pointer hover:text-green-900 focus:outline-none"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="text-black">
                    {y}
                  </option>
                ))}
              </select>
            </h2>
            {filteredRounds.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">
                        Dato
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">
                        {isMobile ? "Sum" : "Resultat"}
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">
                        {isMobile ? "1. hull" : "Kolsåstoppen"}
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">
                        {isMobile ? "2. hull" : "Kløfta"}
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">
                        {isMobile ? "3. hull" : "Månetoppen"}
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">
                        {isMobile ? "4. hull" : "Australia"}
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">
                        {isMobile ? "5. hull" : "Steinkjer"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRounds.slice(0, roundDisplayCount).map((round) => {
                      return (
                        <tr
                          key={round.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                          onClick={() => navigate(`/tournament/${round.id}`)}
                        >
                          <td className="py-3 px-4 font-semibold text-green-800">
                            {formatDate(round.created_at)}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {calculateRoundScoreWithoutPlayerData(round)}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {round.first_hole}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {round.second_hole}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {round.third_hole}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {round.fourth_hole}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {round.fifth_hole}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="flex flex-row gap-2 py-5">
                  <p>
                    Viser{" "}
                    {roundDisplayCount > filteredRounds.length
                      ? filteredRounds.length
                      : roundDisplayCount}{" "}
                    av {filteredRounds.length}{" "}
                    {filteredRounds.length === 1 ? "runde" : "runder"}
                  </p>
                  {filteredRounds.length > roundDisplayCount && (
                    <Plus
                      className="w-6 h-6 font-bold bg-green-600 hover:bg-green-700 rounded-md text-white p-1 hover:shadow-xl cursor-pointer"
                      onClick={() => setRoundDisplayCount((prev) => prev + 10)}
                    />
                  )}
                </div>
              </div>
            ) : (
              <h2>
                {player?.name.split(" ")[0]} spilte ingen runder i{" "}
                {selectedYear}
              </h2>
            )}
          </div>
        )}
      </div>

      {/* Delete player button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {player && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Slett spiller
            </button>
          </div>
        )}
      </div>

      {/* Delete player confirmation modal */}
      {isDeleteOpen && player && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isDeleting && setIsDeleteOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Bekreft sletting
            </h3>
            <p className="text-gray-700 mb-6">
              Er du sikker på at du vil slette {player.name}? Dette kan ikke
              angres.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Avbryt
              </button>
              <button
                onClick={async () => {
                  if (!player) return;
                  setIsDeleting(true);
                  const ok = await deletePlayerAndAssets(player.id);
                  setIsDeleting(false);
                  if (ok) {
                    setIsDeleteOpen(false);
                    navigate("/players");
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-60"
              >
                {isDeleting ? "Sletter..." : "Slett"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerPage;
