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
              <p className="text-green-600 mt-2">Clash of the titans</p>
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
          <div className="space-y-6">
            {[...Highlights]
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((highlight) => (
                <div
                  key={highlight.id}
                  onClick={() => navigate(`/highlight/${highlight.id}`)}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-green-800">
                      {highlight.title}
                    </h2>
                    <div className="text-sm text-green-600 font-medium">
                      {formatDate(highlight.date)}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {highlight.intro}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HighlightsPage;
