import React, { useEffect, useState } from "react";
import { X, Plus, ChevronDown, Check } from "lucide-react";
import type { Course, RoundAttempt } from "../types/types";
import { calculateTotal } from "../utils/scoreUtils";
import {
  getAllPlayers,
  saveRoundAttempt,
  type Player,
} from "../supabase/supabaseClient";
import { getRoundCookie, setRoundCookie } from "../utils/cookieUtil";

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
      const currentRound = getRoundCookie();
      if (currentRound === null) {
        return;
      }
      setScores([
        currentRound.hole1,
        currentRound.hole2,
        currentRound.hole3,
        currentRound.hole4,
        currentRound.hole5,
      ]);
      setSelectedPlayer(currentRound.player ? currentRound.player : null);
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
    resetModal(true);
  };

  const resetModal = (clearRound: boolean) => {
    if (clearRound) {
      setScores([3, 3, 3, 3, 3]);
      setSelectedPlayer(null);
    } else {
      if (selectedPlayer) {
        setRoundCookie({
          hole1: scores[0],
          hole2: scores[1],
          hole3: scores[2],
          hole4: scores[3],
          hole5: scores[4],
          player: selectedPlayer,
        });
      } else {
        setRoundCookie({
          hole1: scores[0],
          hole2: scores[1],
          hole3: scores[2],
          hole4: scores[3],
          hole5: scores[4],
        });
      }
    }
    onClose();

    setDropDownOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="flex min-h-[100dvh] items-start sm:items-center justify-center p-4 overflow-y-auto">
        <div className="mt-8 sm:mt-0 bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto">
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-green-800">
                Registrer ny runde
              </h2>
              <button
                onClick={() => resetModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Spiller
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropDownOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border-2 border-green-200 bg-white px-4 py-3 text-left shadow-sm hover:border-green-400 hover:bg-green-50 focus:outline-none focus:border-green-500 transition-colors"
                >
                  {selectedPlayer ? (
                    <div className="flex items-center gap-3">
                      {selectedPlayer.image_url ? (
                        <img
                          src={selectedPlayer.image_url}
                          alt={selectedPlayer.name}
                          className="w-8 h-8 rounded-full object-cover border border-green-200 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <span className="text-green-800 font-bold text-sm">
                            {selectedPlayer.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="font-semibold text-gray-800">
                        {selectedPlayer.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Velg spiller...</span>
                  )}
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                      dropDownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropDownOpen && (
                  <div className="absolute z-50 mt-2 w-full rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto py-1">
                      {players?.map((player) => (
                        <li key={player.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPlayer(player);
                              setDropDownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors ${
                              selectedPlayer?.id === player.id
                                ? "bg-green-50"
                                : ""
                            }`}
                          >
                            {player.image_url ? (
                              <img
                                src={player.image_url}
                                alt={player.name}
                                className="w-8 h-8 rounded-full object-cover border border-green-200 shrink-0"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <span className="text-green-800 font-bold text-sm">
                                  {player.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <span
                              className={`font-medium flex-1 text-left ${
                                selectedPlayer?.id === player.id
                                  ? "text-green-800"
                                  : "text-gray-700"
                              }`}
                            >
                              {player.name}
                            </span>
                            {selectedPlayer?.id === player.id && (
                              <Check className="w-4 h-4 text-green-600 shrink-0" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Resultater
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {course.holes.map((hole, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-green-800 text-center mb-3">
                      {hole.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleScoreChange(index, scores[index] - 1)
                        }
                        className="w-11 h-11 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center text-xl font-bold transition-colors"
                        disabled={scores[index] <= 1}
                      >
                        −
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
                        className="w-11 h-11 bg-green-100 hover:bg-green-200 text-green-600 rounded-full flex items-center justify-center text-xl font-bold transition-colors"
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
                onClick={() => resetModal(false)}
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
    </div>
  );
};

export default RoundModal;
