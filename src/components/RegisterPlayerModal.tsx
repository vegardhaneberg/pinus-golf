import React, { useState } from "react";
import { X, Plus, Upload, User } from "lucide-react";

interface RegisterPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerName: string, image: File | null) => Promise<boolean>;
}

const RegisterPlayerModal: React.FC<RegisterPlayerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setImageError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    if (!selectedImage) {
      setImageError("Du må laste opp et bilde av spilleren");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    const success = await onSubmit(playerName.trim(), selectedImage);
    setIsSubmitting(false);

    if (!success) {
      setSubmitError("Kunne ikke registrere spilleren, prøv igjen");
      return;
    }

    // Reset form
    setPlayerName("");
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
    onClose();
  };

  const handleClose = () => {
    setPlayerName("");
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
    setSubmitError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-green-800">
              Registrer ny spiller
            </h2>
            <button
              onClick={handleClose}
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
              Navn
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Skriv inn navn"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="playerImage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Bilde
            </label>
            <div className="flex flex-col items-center">
              {imagePreview ? (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-200"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}

              <label className="cursor-pointer bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Velg bilde
                <input
                  type="file"
                  id="playerImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                JPG eller PNG (maks 1MB)
              </p>
              {imageError && (
                <p className="text-sm text-red-600 mt-2">{imageError}</p>
              )}
            </div>
          </div>

          {submitError && (
            <p className="text-sm text-red-600 mb-4">{submitError}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              {isSubmitting ? "Registrerer..." : "Registrer spiller"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPlayerModal;
