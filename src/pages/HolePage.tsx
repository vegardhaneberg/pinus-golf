import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Home,
} from "lucide-react";
import {
  getAllRoundsWithPlayerData,
  getHoleScore,
  type CompleteRoundWithPlayer,
} from "../supabase/supabaseClient";
import { COURSE } from "../data/course";
import type { Hole } from "../types/types";
import { useIsMobile } from "../utils/mobileUtil";

const HoleStatsPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const holeIdFromPath = parseInt(id || "1");
  const [rounds, setRounds] = useState<CompleteRoundWithPlayer[]>();

  useEffect(() => {
    (async () => {
      const supabaseRounds = await getAllRoundsWithPlayerData();
      setRounds(supabaseRounds);
    })();
  }, []);

  if (holeIdFromPath < 1 || holeIdFromPath > 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Ops en feil oppstod!
          </h1>
          <p className="text-gray-600 mb-6">
            Her skjedde det en feil. Fant ingen hull med id {id}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
          >
            <Home className="w-5 h-5" />
            Tilbake
          </button>
        </div>
      </div>
    );
  }

  const newGetHoleInfo = (holeNumber: number): Hole => {
    return COURSE.holes[holeNumber - 1];
  };

  // Get all scores for this specific hole
  const holeScores = rounds
    ?.map((round) => {
      const score = getHoleScore(round, holeIdFromPath);
      return {
        hole: holeIdFromPath,
        par: newGetHoleInfo(holeIdFromPath).par,
        score: score,
        playerName: round.player?.name ?? "Ukjent",
        date: round.created_at,
        roundId: round.id,
      };
    })
    .filter((score) => score.score > 0);

  // Calculate statistics
  const totalScores = holeScores?.map((s) => s.score);
  const averageScore =
    totalScores?.length && totalScores?.length > 0
      ? (
          totalScores.reduce((sum, score) => sum + score, 0) /
          totalScores.length
        ).toFixed(2)
      : "0.00";

  const par = newGetHoleInfo(holeIdFromPath).par;
  const averageRelativeToPar = parseFloat(averageScore) - par;

  // Hole in ones (score of 1)
  const holeInOnes = holeScores?.filter((s) => s.score === 1);

  // Eagles (2 under par)
  const eagles = holeScores?.filter((s) => s.score === par - 2);

  // Birdies (1 under par)
  const birdies = holeScores?.filter((s) => s.score === par - 1);

  // Pars
  const pars = holeScores?.filter((s) => s.score === par);

  // Bogeys (1 over par)
  const bogeys = holeScores?.filter((s) => s.score === par + 1);

  // Double bogeys and worse
  const doubleBogeyPlus = holeScores?.filter((s) => s.score >= par + 2);

  // Best and worst scores
  const bestScore = totalScores ? Math.min(...totalScores) : 999;
  const worstScore = totalScores ? Math.max(...totalScores) : 999;
  const bestScorers = holeScores?.filter((s) => s.score === bestScore);
  const worstScorers = holeScores?.filter((s) => s.score === worstScore);

  // Score distribution for chart
  const scoreDistribution: Record<number, number> = {};
  totalScores?.forEach((score) => {
    scoreDistribution[score] = (scoreDistribution[score] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(scoreDistribution));

  const holeInfo = newGetHoleInfo(holeIdFromPath);

  return (
    <>
      {rounds && totalScores && bestScorers && worstScorers && holeInOnes && (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-green-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="p-2 hover:bg-green-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-green-600" />
                </button>
                <div>
                  <h1 className="text-3xl sm:text-xl font-bold text-green-800">
                    {newGetHoleInfo(holeIdFromPath).name}
                  </h1>
                  <p className="text-green-600">
                    Par {par} • {holeInfo.distance} meter
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hole Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-green-800">Overview</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-800 mb-1">
                    {par}
                  </div>
                  <div className="text-gray-600">Par</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-800 mb-1">
                    {holeInfo.distance}
                  </div>
                  <div className="text-gray-600">Meter</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-800 mb-1">
                    {totalScores.length}
                  </div>
                  <div className="text-gray-600">Spilte runder</div>
                </div>
              </div>
              <p className="text-gray-700 mt-4 text-center italic">
                {holeInfo.description}
              </p>
            </div>

            {/* Key Statistics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {averageScore}
                </div>
                <div className="text-gray-600 mb-2">Gjennomsnitt slag</div>
                <div
                  className={`text-sm font-semibold ${
                    averageRelativeToPar < 0
                      ? "text-green-600"
                      : averageRelativeToPar > 0
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {averageRelativeToPar === 0
                    ? "Even with par"
                    : averageRelativeToPar > 0
                    ? `+${averageRelativeToPar.toFixed(2)} over par`
                    : `${averageRelativeToPar.toFixed(2)} under par`}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Award className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {bestScore}
                </div>
                <div className="text-gray-600 mb-2">Beste resultat</div>
                <div className="text-sm text-gray-500">
                  {bestScorers.length} {}
                  {bestScorers.length > 1 ? "spillere" : "spiller"}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <BarChart3 className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {worstScore}
                </div>
                <div className="text-gray-600 mb-2">Verste resultat</div>
                <div className="text-sm text-gray-500">
                  {worstScorers.length}
                  {worstScorers.length > 1 ? "spillere" : "spiller"}
                </div>
              </div>
              {pars && (
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {((pars.length / totalScores.length) * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-600 mb-2">Par Rate</div>
                  <div className="text-sm text-gray-500">
                    {pars.length} av {totalScores.length} ganger
                  </div>
                </div>
              )}
            </div>

            {/* Hole in Ones Section */}
            {holeInOnes.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-green-800">
                    Hall of fame 🏆
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {holeInOnes.map((achievement, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500"
                    >
                      <div className="font-bold text-gray-800 mb-1">
                        {achievement.playerName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(achievement.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                      <div className="text-xs text-yellow-700 mt-2 font-semibold">
                        ⭐ HOLE IN ONE!
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Score Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-green-800 mb-6">
                Slagstatistikk
              </h2>
              <div className="space-y-3">
                {Object.entries(scoreDistribution)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([score, count]) => {
                    const percentage = (count / totalScores.length) * 100;
                    const barWidth = (count / maxCount) * 100;
                    const scoreDiff = parseInt(score) - par;

                    return (
                      <div
                        key={score}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                      >
                        <div className="w-full sm:w-16 text-left sm:text-right font-semibold text-gray-800 text-sm sm:text-base">
                          {score} slag
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 sm:h-8 relative min-w-0">
                          <div
                            className={`h-full rounded-full flex items-center justify-end pr-2 sm:pr-3 text-white font-semibold text-xs sm:text-sm transition-all duration-300 ${
                              scoreDiff < 0
                                ? "bg-green-500"
                                : scoreDiff === 0
                                ? "bg-blue-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${Math.max(barWidth, 15)}%` }}
                          >
                            <span className="whitespace-nowrap">
                              {count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                        <div
                          className={`"w-full sm:w-20 text-xs sm:text-sm text-gray-600 text-left sm:text-left ${
                            isMobile ? "hidden" : ""
                          }`}
                        >
                          {scoreDiff === 0
                            ? "Par"
                            : scoreDiff < 0
                            ? `${Math.abs(scoreDiff)} under`
                            : `${scoreDiff} over`}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-6">
                Performance Breakdown
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newGetHoleInfo(holeIdFromPath).par > 3 &&
                  eagles?.length &&
                  eagles?.length > 0 && (
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700 mb-1">
                        {eagles.length}
                      </div>
                      <div className="text-yellow-600 font-semibold">
                        Eagles
                      </div>
                      <div className="text-sm text-gray-600">(-2 strokes)</div>
                    </div>
                  )}

                {holeInOnes?.length > 0 && (
                  <div className="text-center p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg border-2 border-yellow-400">
                    <div className="text-2xl font-bold text-yellow-800 mb-1">
                      {holeInOnes.length}
                    </div>
                    <div className="text-yellow-700 font-semibold">
                      Hole in One
                    </div>
                    <div className="text-sm text-yellow-600">
                      🏆 Rett i koppen!
                    </div>
                  </div>
                )}

                {birdies && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 mb-1">
                      {birdies.length}
                    </div>
                    <div className="text-green-600 font-semibold">Birdies</div>
                    <div className="text-sm text-gray-600">-1 slag</div>
                  </div>
                )}
                {pars && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 mb-1">
                      {pars.length}
                    </div>
                    <div className="text-blue-600 font-semibold">Par</div>
                    <div className="text-sm text-gray-600">0</div>
                  </div>
                )}

                {bogeys && (
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-700 mb-1">
                      {bogeys.length}
                    </div>
                    <div className="text-orange-600 font-semibold">Bogeys</div>
                    <div className="text-sm text-gray-600">+1 slag</div>
                  </div>
                )}
                {doubleBogeyPlus && (
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-700 mb-1">
                      {doubleBogeyPlus.length}
                    </div>
                    <div className="text-red-600 font-semibold">
                      Double Bogey+
                    </div>
                    <div className="text-sm text-gray-600">+2 eller mer</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HoleStatsPage;
