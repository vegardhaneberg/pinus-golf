import { useEffect, useState } from "react";
import "../App.css";
import {
  calculateRoundScore,
  getAllRoundsWithPlayerData,
  type CompleteRoundWithPlayer,
} from "../supabase/supabaseClient";
import { COURSE } from "../data/course";
import RecentResults from "../components/RecentResults";
import TopScores from "../components/TopScores";
import RoundModal from "../components/RoundModal";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../utils/mobileUtil";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  // Book02Icon, // unused while "Høydepunkter" nav item is hidden
  GolfBallIcon,
  GolfBatIcon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { Flag, Award, TrendingUp, Users } from "lucide-react";

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
                    <HugeiconsIcon
                      icon={GolfBallIcon}
                      size={30}
                      color="white"
                      strokeWidth={1.5}
                    />
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
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-normal flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
                >
                  <HugeiconsIcon
                    icon={GolfBatIcon}
                    size={24}
                    color="white"
                    strokeWidth={1.5}
                  />
                  Spillere
                </button>
                {/* <button
                  onClick={() => navigate("/highlights")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-normal flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
                >
                  <HugeiconsIcon
                    icon={Book02Icon}
                    size={24}
                    color="white"
                    strokeWidth={1.5}
                  />
                  Høydepunkter
                </button> */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-normal flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
                >
                  <HugeiconsIcon
                    icon={Add01Icon}
                    size={24}
                    color="white"
                    strokeWidth={1.5}
                  />
                  Registrer runde
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden relative">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
                >
                  <HugeiconsIcon
                    icon={Menu01Icon}
                    size={24}
                    color="white"
                    strokeWidth={1.5}
                  />
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
                      <HugeiconsIcon
                        icon={GolfBatIcon}
                        size={24}
                        color="black"
                        strokeWidth={1.5}
                      />
                      Spillere
                    </button>
                    {/* <button
                      onClick={() => {
                        navigate("/highlights");
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                    >
                      <HugeiconsIcon
                        icon={Book02Icon}
                        size={24}
                        color="black"
                        strokeWidth={1.5}
                      />
                      Høydepunkter
                    </button> */}
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                    >
                      <HugeiconsIcon
                        icon={Add01Icon}
                        size={24}
                        color="black"
                        strokeWidth={1.5}
                      />
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
              svingninger og enorme mengder frustrasjon ⛳️ Klikk på ett av de
              frem hullene under for å lese mer!
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {COURSE.holes.map((hole) => (
                <div
                  key={hole.number}
                  className={`bg-gradient-to-b from-green-50 to-green-100 border border-green-200 p-4 rounded-xl text-center cursor-pointer hover:from-green-100 hover:to-green-200 hover:border-green-300 hover:shadow-md ${
                    isMobile
                      ? ""
                      : "transition-all duration-200 ease-in-out hover:-translate-y-1"
                  }`}
                  onClick={() => navigateToHole(hole.number)}
                >
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-2">
                    {hole.number}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-green-800 mb-1">
                    {hole.name}
                  </div>
                  <div className="text-xs text-green-600 leading-tight">
                    {hole.description}
                  </div>
                  <div className="mt-2 text-xs text-green-700 font-medium opacity-75">
                    Par {hole.par}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                Total par {COURSE.holes.reduce((total, hole) => total + hole.par, 0)}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentResults rounds={completeRounds.slice(0, 5)} />
            <TopScores rounds={completeRounds} />
          </div>
        </div>

        {/* Statistics Footer */}
        <footer className="bg-white border-t border-green-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center gap-1">
                <Flag className="w-5 h-5 text-green-500 mb-1" />
                <div className="text-3xl font-bold text-green-800">
                  {completeRounds.length}
                </div>
                <div className="text-sm text-green-600">Spilte runder</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Award className="w-5 h-5 text-yellow-500 mb-1" />
                <div className="text-3xl font-bold text-green-800">
                  {completeRounds.length > 0
                    ? Math.min(
                        ...completeRounds.map((r) => calculateRoundScore(r))
                      )
                    : "-"}
                </div>
                <div className="text-sm text-green-600">Beste runde</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <TrendingUp className="w-5 h-5 text-blue-500 mb-1" />
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
                <div className="text-sm text-green-600">Gjennomsnitt slag</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users className="w-5 h-5 text-purple-500 mb-1" />
                <div className="text-3xl font-bold text-green-800">
                  {completeRounds &&
                    new Set(completeRounds.map((r) => r.player?.id)).size}
                </div>
                <div className="text-sm text-green-600">Spillere</div>
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
