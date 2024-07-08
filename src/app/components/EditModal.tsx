// components/EditModal.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { updateRecipe } from "@/lib/actions/recipe.action";

interface EditModalProps {
  // Assuming Recipe interface is imported or defined
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ onClose }) => {
  const router = useRouter();
  //   const [updatedRecipe, setUpdatedRecipe] = useState<Recipe>({
  //     ...recipe, // Initialize with current recipe details
  //   });

  //   const handleSubmit = async () => {
  //     try {
  //       await updateRecipe(updatedRecipe); // Implement updateRecipe function accordingly
  //       onClose(); // Close modal after successful update
  //       router.reload(); // Reload the page to reflect updated recipe details
  //     } catch (error) {
  //       console.error("Error updating recipe:", error);
  //       // Handle error (e.g., show error message)
  //     }
  //   };

  //   const handleChange = (
  //     event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  //   ) => {
  //     const { name, value } = event.target;
  //     setUpdatedRecipe((prevRecipe) => ({
  //       ...prevRecipe,
  //       [name]: value,
  //     }));
  //   };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96">
        <h2 className="text-2xl font-semibold mb-4">Edit Recipe</h2>
        <label className="block mb-2">
          Title:
          <input
            type="text"
            name="title"
            // value={updatedRecipe.title}
            // onChange={handleChange}
            className="block w-full border-gray-300 rounded-lg mt-1"
          />
        </label>
        <label className="block mb-2">
          Description:
          <textarea
            name="description"
            // value={updatedRecipe.description}
            // onChange={handleChange}
            className="block w-full border-gray-300 rounded-lg mt-1"
          />
        </label>
        <label className="block mb-4">
          Cook Time:
          <input
            type="text"
            name="cookTime"
            // value={updatedRecipe.cookTime}
            // onChange={handleChange}
            className="block w-full border-gray-300 rounded-lg mt-1"
          />
        </label>
        <div className="flex justify-end">
          <button
            // onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
