"use client";

import { useRouter } from "next/navigation";

interface DeleteModalProps {
  onClose: () => void;
  handleDelete: () => Promise<void>;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ onClose, handleDelete }) => {
  const router = useRouter();

  const confirmAndDelete = async () => {
    try {
      await handleDelete();
      onClose();
      router.push("/my-cookbook");
      // Give push a tick before refresh
      setTimeout(() => {
        router.refresh();
      }, 50);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Something went wrong while deleting the recipe.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[5000] animate-fadeIn">
      <div className="bg-amber-50/95 border border-amber-200 rounded-3xl shadow-2xl p-8 w-[90%] max-w-md text-center">
        {/* Title */}
        <h2 className="text-3xl font-[Homemade Apple] text-amber-800 mb-3">
          Delete Recipe?
        </h2>

        {/* Message */}
        <p className="text-amber-700 font-serif mb-6 leading-relaxed">
          Are you sure you want to delete this recipe?
          <br />
          <span className="text-red-600 font-semibold">
            This action cannot be undone.
          </span>
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
          {/* Delete */}
          <button
            onClick={confirmAndDelete}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold shadow-md hover:from-red-700 hover:to-red-600 transition-all duration-300"
          >
            Yes, Delete
          </button>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-amber-200 text-amber-800 font-semibold shadow-sm hover:bg-amber-300 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default DeleteModal;
