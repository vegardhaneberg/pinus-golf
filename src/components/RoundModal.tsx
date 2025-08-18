import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import type { Round, HoleScore, Course } from "../types";
import { calculateTotal, calculateTotalPar } from "../utils/scoreUtils";

interface RoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (round: Round) => void;
  course: Course;
}

const RoundModal: React.FC<RoundModalProps> = ({
  isOpen,
  onClose,
  onSave,
  course,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [scores, setScores] = useState<HoleScore[]>(
    course.holes.map((hole) => ({
      name: hole.name,
      hole: hole.number,
      par: hole.par,
      score: hole.par,
    }))
  );

  const handleScoreChange = (holeIndex: number, newScore: number) => {
    const updatedScores = [...scores];
    updatedScores[holeIndex].score = Math.max(1, newScore);
    setScores(updatedScores);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const round: Round = {
      id: Date.now().toString(),
      playerId: Date.now().toString(),
      playerName: playerName.trim(),
      date: new Date().toISOString(),
      scores,
      totalScore: calculateTotal(scores),
      totalPar: calculateTotalPar(scores),
    };

    onSave(round);

    // Reset form
    setPlayerName("");
    setScores(
      course.holes.map((hole) => ({
        hole: hole.number,
        par: hole.par,
        score: hole.par,
      }))
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-green-800">
              Registrer ny runde
            </h2>
            <button
              onClick={onClose}
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
              Player Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Enter player name"
              required
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Hole Scores
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scores.map((holeScore, index) => (
                <div key={holeScore.hole} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-800">
                      {holeScore.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      Par {holeScore.par}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleScoreChange(index, holeScore.score - 1)
                      }
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
                      disabled={holeScore.score <= 1}
                    >
                      -
                    </button>
                    <div className="flex-1 text-center">
                      <input
                        type="number"
                        value={holeScore.score}
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
                        handleScoreChange(index, holeScore.score + 1)
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
              <span className="font-semibold text-green-800">Total Score:</span>
              <span className="text-2xl font-bold text-green-800">
                {calculateTotal(scores)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Register Round
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoundModal;
