import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Highlights } from "../supabase/supabaseClient";

const HighlightsPage: React.FC = () => {
  const navigate = useNavigate();
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("nb-NO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-green-50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-green-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-green-800">
                Høydepunkter
              </h1>
              <p className="text-green-600 mt-2">Pinus golf ™</p>
            </div>
          </div>
        </div>
      </header>

      {/* Highlights Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Highlights.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">
              Ingen høydepunkter registrert ennå.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...Highlights]
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((highlight) => (
                <div
                  key={highlight.id}
                  onClick={() => navigate(`/highlight/${highlight.id}`)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-transparent hover:border-green-200"
                >
                  <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h2 className="text-xl font-bold text-green-800">
                        {highlight.title}
                      </h2>
                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">
                        {formatDate(highlight.date)}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base line-clamp-3">
                      {highlight.intro}
                    </p>
                    <div className="mt-4 flex items-center text-green-600 text-sm font-semibold gap-1">
                      Les mer
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HighlightsPage;
