import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Highlights,
  type Highlight,
  type CompleteRoundWithPlayer,
  getRoundWithPlayerData,
  calculateRoundScore,
} from "../supabase/supabaseClient";
import MultiRoundChart from "../components/MultiRoundChart";
import { COURSE } from "../data/course";

const HighlightDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const highlightId = Number(id);
  const navigate = useNavigate();
  const [rounds, setRounds] = useState<CompleteRoundWithPlayer[]>([]);

  const highlight: Highlight | undefined = Highlights.find(
    (h) => h.id === highlightId
  );

  useEffect(() => {
    if (highlight && highlight.roundIds && highlight.roundIds.length > 0) {
      (async () => {
        const fetchedRounds = await Promise.all(
          highlight.roundIds.map((roundId) => getRoundWithPlayerData(roundId))
        );
        setRounds(fetchedRounds);
      })();
    }
  }, [highlight]);

  const formatHighlightDate = (date: Date) => {
    return date.toLocaleDateString("nb-NO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!highlight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <header className="bg-white shadow-sm border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/highlights")}
                className="p-2 hover:bg-green-50 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-green-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-green-800">
                  Høydepunkt ikke funnet
                </h1>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">
              Fant ikke høydepunkt med ID {highlightId}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/highlights")}
              className="p-2 hover:bg-green-50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-green-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-green-800">
                {formatHighlightDate(highlight.date)}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-6">
            {highlight.title}
          </h2>

          {/* Image */}
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src="/pinus-golf-course.jpg"
              alt="Pinus Golf Course"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Intro */}
          <p className="text-gray-700 leading-relaxed text-lg md:text-xl mb-8 font-bold">
            {highlight.intro}
          </p>

          {/* Blocks */}
          {highlight.blocks && highlight.blocks.length > 0 && (
            <div className="space-y-8">
              {highlight.blocks.map((block, index) => (
                <div key={index}>
                  <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-4">
                    {block.subtitle}
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base md:text-lg whitespace-pre-line">
                    {block.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Round Chart */}
          {rounds.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-green-800 mb-4">
                  Resultater
                </h3>
                <div className="space-y-2 mb-4">
                  {rounds.map((round) => (
                    <div
                      key={round.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span
                        className="font-semibold text-green-800 cursor-pointer hover:underline"
                        onClick={() => navigate(`/player/${round.player_id}`)}
                      >
                        {round.player?.name ?? "Ukjent"}
                      </span>
                      <span className="text-gray-600">
                        {calculateRoundScore(round) + " slag"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <MultiRoundChart
                par={COURSE.holes[0]?.par ?? 3}
                rounds={rounds}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HighlightDetailPage;
