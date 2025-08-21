import { useEffect, useState } from "react";
import "./App.css";
import { MapPin, Plus } from "lucide-react";
import RecentResults from "./components/RecentResults";
import TopScores from "./components/TopScores";
import RoundModal from "./components/RoundModal";
import {
  calculateRoundScore,
  getAllRoundsWithPlayerData,
  getFiveBestRounds,
  getNumberOfUniquePlayers,
  type CompleteRoundWithPlayer,
} from "./supabase/supabaseClient";
import { COURSE } from "./data/course";

function App() {
  const [completeRounds, setCompleteRounds] = useState<
    CompleteRoundWithPlayer[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const supabaseRounds = await getAllRoundsWithPlayerData();
      setCompleteRounds(supabaseRounds);
    })();
  }, []);

  const handleModalClose = async () => {
    const allRounds = await getAllRoundsWithPlayerData();
    setCompleteRounds(allRounds);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-green-800">
                      {COURSE.name}
                    </h1>
                    <p className="text-green-600">5 hull én mester</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                {/* Registrer runde */}
              </button>
            </div>
          </div>
        </header>

        {/* Course Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-green-800 mb-4">
              Pinus Golfbane
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {COURSE.holes.map((hole) => (
                <div
                  key={hole.number}
                  className="bg-green-50 p-4 rounded-lg text-center"
                >
                  <div className="text-2xl font-bold text-green-800 mb-1">
                    {hole.name}
                  </div>
                  <div className="text-sm text-green-600">
                    {hole.description}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-lg font-semibold text-green-800">
                Par {COURSE.holes.reduce((total, hole) => total + hole.par, 0)}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentResults rounds={completeRounds.slice(0, 5)} />
            <TopScores rounds={getFiveBestRounds(completeRounds)} />
          </div>
        </div>

        {/* Statistics Footer */}
        <footer className="bg-white border-t border-green-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-green-800">
                  {completeRounds.length}
                </div>
                <div className="text-green-600">Registrerte runder</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-800">
                  {completeRounds.length > 0
                    ? Math.min(
                        ...completeRounds.map((r) => calculateRoundScore(r))
                      )
                    : "-"}
                </div>
                <div className="text-green-600">Beste runde</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-800">
                  {completeRounds.length > 0
                    ? Math.round(
                        completeRounds.reduce(
                          (sum, r) => sum + calculateRoundScore(r),
                          0
                        ) / completeRounds.length
                      )
                    : "-"}
                </div>
                <div className="text-green-600">Gjennomsnitt slag</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-800">
                  {completeRounds && getNumberOfUniquePlayers(completeRounds)}
                </div>
                <div className="text-green-600">Registrerte spillere</div>
              </div>
            </div>
          </div>
        </footer>

        {/* Round Registration Modal */}
        <RoundModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          course={COURSE}
        />
      </div>
    </>
  );
}

export default App;
