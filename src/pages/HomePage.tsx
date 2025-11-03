import { useEffect, useState } from "react";
import "../App.css";
import { BarChart3, MapPin, Menu, Plus, Users } from "lucide-react";
import {
  calculateRoundScore,
  getAllRoundsWithPlayerData,
  getFiveBestRounds,
  type CompleteRoundWithPlayer,
} from "../supabase/supabaseClient";
import { COURSE } from "../data/course";
import RecentResults from "../components/RecentResults";
import TopScores from "../components/TopScores";
import RoundModal from "../components/RoundModal";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../utils/mobileUtil";

const HomePage: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [completeRounds, setCompleteRounds] = useState<
    CompleteRoundWithPlayer[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  const navigateToHole = (id: number) => {
    navigate(`/hole/${id}`);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="cursor-pointer">
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

              {/* Desktop Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => navigate("/players")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
                >
                  <Users className="w-5 h-5" />
                  Spillere
                </button>
                <button
                  onClick={() => navigate("/highlights")}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
                >
                  <BarChart3 className="w-5 h-5" />
                  Høydepunkter
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Registrer runde
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden relative">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Mobile Dropdown Menu */}
                {showMobileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        navigate("/players");
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                    >
                      <Users className="w-5 h-5 text-blue-600" />
                      Spillere
                    </button>
                    <button
                      onClick={() => {
                        navigate("/highlights");
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                    >
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      Høydepunkter
                    </button>
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-green-600" />
                      Registrer runde
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Course Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-green-800 mb-2">
              Pinus Golfbane
            </h2>
            <p className="text-gray-500 mb-4">
              Pinus golfbane er blant de mest anerkjente 5-hulls
              terrenggolfbanene i Norge. Lokalisert på vakre Vesterøy i Hvaler,
              har banen gjort seg bemerket med tighte dueller, plutselige
              svingninger og enorme mengder frustrasjon ⛳️
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {COURSE.holes.map((hole) => (
                <div
                  key={hole.number}
                  className={`bg-green-50 p-4 rounded-lg text-center cursor-pointer hover:bg-green-100 ${
                    isMobile
                      ? ""
                      : "transition duration-50 ease-in-out hover:-translate-y-1 hover:scale-105"
                  }`}
                  onClick={() => navigateToHole(hole.number)}
                >
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800 mb-1">
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
                <div className="text-green-600">Spilte runder</div>
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
                  {completeRounds &&
                    new Set(completeRounds.map((r) => r.player?.id)).size}
                </div>
                <div className="text-green-600">Spillere</div>
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
};

export default HomePage;
