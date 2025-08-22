import React, { useEffect, useState } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import type { Course, RoundAttempt } from "../types/types";
import { calculateTotal } from "../utils/scoreUtils";
import {
  getAllPlayers,
  saveRoundAttempt,
  type Player,
} from "../supabase/supabaseClient";

interface RoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

const RoundModal: React.FC<RoundModalProps> = ({ isOpen, onClose, course }) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [scores, setScores] = useState<number[]>([3, 3, 3, 3, 3]);
  const [players, setPlayers] = useState<Player[]>();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    (async () => {
      const supabasePlayers = await getAllPlayers();
      setPlayers(supabasePlayers);
    })();
  }, []);

  const handleScoreChange = (holeIndex: number, newScore: number) => {
    const updatedScores = [...scores];
    updatedScores[holeIndex] = Math.max(1, newScore);
    setScores(updatedScores);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    const roundAttempt: RoundAttempt = {
      hole1: scores[0],
      hole2: scores[1],
      hole3: scores[2],
      hole4: scores[3],
      hole5: scores[4],
      player: selectedPlayer!,
    };

    await saveRoundAttempt(roundAttempt);
    resetModal();
  };

  const resetModal = () => {
    onClose();
    setScores([3, 3, 3, 3, 3]);
    setDropDownOpen(false);
    setSelectedPlayer(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-green-800">
              Registrer ny runde
            </h2>
            <button
              onClick={resetModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label
              htmlFor="playerName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Spiller
            </label>
            <div className="relative inline-block text-left">
              <button
                onClick={() => setDropDownOpen((prev) => !prev)}
                className="inline-flex w-48 justify-between items-center rounded-lg bg-green-200 px-4 py-2 text-sm font-medium text-green-900 shadow hover:bg-green-300 focus:outline-none"
              >
                {selectedPlayer?.name || "Velg spiller"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </div>
            {dropDownOpen && (
              <div className="absolute mt-2 w-48 rounded-lg bg-green-100 shadow-lg ring-1 ring-black ring-opacity-5">
                <ul className="py-1">
                  {players &&
                    players.map((player) => (
                      <li key={player.id}>
                        <button
                          onClick={() => {
                            setSelectedPlayer(player);
                            setDropDownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-green-900 hover:bg-green-200"
                        >
                          {player.name}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Resultater
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {course.holes.map((hole, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-800">
                      {hole.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      Par {hole.par}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleScoreChange(index, scores[index] - 1)
                      }
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
                      disabled={scores[index] <= 1}
                    >
                      -
                    </button>
                    <div className="flex-1 text-center">
                      <input
                        type="number"
                        value={scores[index]}
                        onChange={(e) =>
                          handleScoreChange(
                            index,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-16 text-center px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="1"
                        max="20"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleScoreChange(index, scores[index] + 1)
                      }
                      className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-full flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-green-800">Totalt:</span>
              <span className="text-2xl font-bold text-green-800">
                {calculateTotal(scores)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetModal}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoundModal;
