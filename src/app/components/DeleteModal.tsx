import { useRouter } from "next/navigation"; // Use next/router instead of next/navigation

interface EditModalProps {
  onClose: () => void;
  handleDelete: () => Promise<void>;
}

const EditModal: React.FC<EditModalProps> = ({ onClose, handleDelete }) => {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white flex flex-col items-center p-6 rounded-lg shadow-lg w-full sm:w-96 overflow-y-auto max-h-[90vh]">
        <h4 className="text-2xl text-center font-semibold mb-4">
          Are you sure you want to delete this recipe?
        </h4>
        <div className="w-full flex justify-around">
          <button
            className="bg-red-500 text-white px-2 py-2 rounded-lg hover:bg-red-600"
            onClick={() => handleDelete()}
          >
            Delete
          </button>
          <button
            className="bg-green-500 text-white px-2 py-2 rounded-lg hover:bg-green-600"
            onClick={() => onClose()}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
