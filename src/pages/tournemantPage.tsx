import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  type CompleteRoundWithPlayer,
  getRoundWithPlayerData,
} from "../supabase/supabaseClient";
import { MapPin } from "lucide-react";
import { COURSE } from "../data/course";
import RoundChart from "../components/RoundChart";

const TournamentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const roundId = Number(id);

  const [round, setRound] = useState<CompleteRoundWithPlayer>();

  useEffect(() => {
    (async () => {
      const supabaseRound = await getRoundWithPlayerData(roundId);
      setRound(supabaseRound);
    })();
  }, [roundId]);

  return (
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
          </div>
        </div>
      </header>

      {/* Course Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-4">
            Pinus Golfbane
          </h2>

          {round && (
            <div>
              <RoundChart par={3} round={round} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentPage;
