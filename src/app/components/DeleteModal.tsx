"use client";

interface DeleteModalProps {
  onClose: () => void;
  handleDelete: () => Promise<void>;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ onClose, handleDelete }) => {
  const confirmAndDelete = async () => {
    try {
      await handleDelete(); // ✅ Calls the server action directly
      onClose(); // ✅ Close the modal on success
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Something went wrong while deleting the recipe.");
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white flex flex-col items-center p-6 rounded-lg shadow-lg w-full sm:w-96 overflow-y-auto max-h-[90vh]">
        <h4 className="text-2xl text-center font-semibold mb-4">
          Are you sure you want to delete this recipe?
        </h4>
        <div className="w-full flex justify-around">
          <button
            className="bg-red-500 text-white px-4 py-2 shadow-lg rounded-xl hover:bg-red-600 transition"
            onClick={confirmAndDelete}
          >
            Delete
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 shadow-lg rounded-xl hover:bg-green-600 transition"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
