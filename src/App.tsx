import { useEffect, useState } from "react";
import "./App.css";
import type { Course, Round } from "./types";
import { MapPin, Plus } from "lucide-react";
import { sortRoundsByDate, sortRoundsByScore } from "./utils/scoreUtils";
import RecentResults from "./components/RecentResults";
import TopScores from "./components/TopScores";
import RoundModal from "./components/RoundModal";

const COURSE: Course = {
  name: "Pinus Golf",
  holes: [
    {
      name: "Kolsåstoppen",
      number: 1,
      par: 4,
      description: "Elsket og hatet.",
    },
    { name: "Kløfta", number: 2, par: 3, description: "Her må ballen løftes" },
    {
      name: "Månetoppen",
      number: 3,
      par: 5,
      description: "Høyt utslag, kan gå alle veier",
    },
    {
      name: "Australia",
      number: 4,
      par: 4,
      description: "Størst mulighet for hole in one",
    },
    {
      name: "Steinkjer",
      number: 5,
      par: 3,
      description: "Kjent for å være utfordrende",
    },
  ],
};

// Sample data for demonstration
const SAMPLE_ROUNDS: Round[] = [
  {
    id: "1",
    playerId: "1",
    playerName: "Helene Maria Tellefsen",
    date: "2024-01-15T10:30:00Z",
    scores: [
      { hole: 1, par: 4, score: 3 },
      { hole: 2, par: 3, score: 3 },
      { hole: 3, par: 5, score: 4 },
      { hole: 4, par: 4, score: 4 },
      { hole: 5, par: 3, score: 2 },
    ],
    totalScore: 16,
    totalPar: 19,
  },
  {
    id: "2",
    playerId: "2",
    playerName: "Vegard Haneberg",
    date: "2024-01-14T14:15:00Z",
    scores: [
      { hole: 1, par: 4, score: 4 },
      { hole: 2, par: 3, score: 3 },
      { hole: 3, par: 5, score: 5 },
      { hole: 4, par: 4, score: 3 },
      { hole: 5, par: 3, score: 3 },
    ],
    totalScore: 18,
    totalPar: 19,
  },
  {
    id: "3",
    playerId: "3",
    playerName: "Frikk Hald Andersen",
    date: "2024-01-13T09:45:00Z",
    scores: [
      { hole: 1, par: 4, score: 5 },
      { hole: 2, par: 3, score: 3 },
      { hole: 3, par: 5, score: 6 },
      { hole: 4, par: 4, score: 4 },
      { hole: 5, par: 3, score: 4 },
    ],
    totalScore: 22,
    totalPar: 19,
  },
  {
    id: "4",
    playerId: "4",
    playerName: "Tellef Tellefsen",
    date: "2024-01-12T16:20:00Z",
    scores: [
      { hole: 1, par: 4, score: 4 },
      { hole: 2, par: 3, score: 2 },
      { hole: 3, par: 5, score: 5 },
      { hole: 4, par: 4, score: 4 },
      { hole: 5, par: 3, score: 3 },
    ],
    totalScore: 18,
    totalPar: 19,
  },
];

function App() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize with sample data
  useEffect(() => {
    setRounds(SAMPLE_ROUNDS);
  }, []);

  const handleSaveRound = (newRound: Round) => {
    setRounds((prevRounds) => [...prevRounds, newRound]);
  };

  const recentRounds = sortRoundsByDate(rounds).slice(0, 3);
  const topScores = sortRoundsByScore(rounds).slice(0, 5);

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
                Registrer runde
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
                Par: {COURSE.holes.reduce((total, hole) => total + hole.par, 0)}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentResults rounds={recentRounds} />
            <TopScores rounds={topScores} />
          </div>
        </div>

        {/* Statistics Footer */}
        <footer className="bg-white border-t border-green-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-green-800">
                  {rounds.length}
                </div>
                <div className="text-green-600">Total Rounds</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-800">
                  {rounds.length > 0
                    ? Math.min(...rounds.map((r) => r.totalScore))
                    : "-"}
                </div>
                <div className="text-green-600">Best Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-800">
                  {rounds.length > 0
                    ? Math.round(
                        rounds.reduce((sum, r) => sum + r.totalScore, 0) /
                          rounds.length
                      )
                    : "-"}
                </div>
                <div className="text-green-600">Average Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-800">
                  {new Set(rounds.map((r) => r.playerName)).size}
                </div>
                <div className="text-green-600">Players</div>
              </div>
            </div>
          </div>
        </footer>

        {/* Round Registration Modal */}
        <RoundModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveRound}
          course={COURSE}
        />
      </div>
    </>
  );
}

export default App;
