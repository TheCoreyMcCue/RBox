"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateRecipe } from "@/lib/actions/recipe.action";
import ImageUpload from "./ImageUpload";

import { Ingredient, Recipe } from "../utils/types";
import { handleStepChange, handleIngredientChange } from "@/app/utils/helper";
import { unitOptions } from "../utils/data";

interface EditModalProps {
  onClose: () => void;
  recipe: Recipe;
}

const EditModal: React.FC<EditModalProps> = ({ onClose, recipe }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const clerkId = session?.user?.clerkId;

  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description);
  const [cookTime, setCookTime] = useState(recipe.cookTime);
  const [image, setImage] = useState(recipe.image);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe.ingredients
  );
  const [steps, setSteps] = useState<string[]>(recipe.steps);
  const [categories, setCategories] = useState<string[]>(recipe.category);
  const [error, setError] = useState<string | null>(null);

  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { amount: "", unit: "", name: "" }]);
  };

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleAddCategory = () => {
    setCategories([...categories, ""]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const handleRemoveCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clerkId) {
      setError("You must be signed in to update a recipe.");
      return;
    }

    if (clerkId === recipe.creator) {
      try {
        const updatedRecipe = await updateRecipe(recipe._id, {
          creator: clerkId,
          title,
          description,
          cookTime,
          image,
          ingredients,
          steps,
          category: categories,
        });

        console.log("Recipe updated successfully:", updatedRecipe);
        router.push("/dashboard");
      } catch (error) {
        console.error("Error updating recipe:", error);
        setError("Failed to update recipe. Please try again.");
      }
    } else {
      setError("You do not have permission to edit this recipe.");
      onClose();
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold mb-4">Edit Recipe</h2>
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md"
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Cook Time (minutes)
            </label>
            <input
              type="text"
              value={cookTime}
              inputMode="decimal"
              pattern="^(?:\d+(?:[.,]?\d*)?|\d+\s*\/\s*\d+)$"
              onChange={(e) => setCookTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Image URL
            </label>
            <ImageUpload setImage={setImage} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Ingredients
            </label>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center mb-2">
                  <input
                    type="text"
                    value={ingredient.amount}
                    placeholder="Qty"
                    onChange={(e) =>
                      handleIngredientChange(
                        ingredients,
                        setIngredients,
                        index,
                        "amount",
                        e.target.value
                      )
                    }
                    className="w-1/3 px-3 py-2 mr-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                  <select
                    value={ingredient.unit}
                    onChange={(e) =>
                      handleIngredientChange(
                        ingredients,
                        setIngredients,
                        index,
                        "unit",
                        e.target.value
                      )
                    }
                    className="w-1/2 px-3 py-2 mr-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Select Unit
                    </option>
                    {unitOptions.map((option, idx) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={ingredient.name}
                    placeholder="Ingredient"
                    onChange={(e) =>
                      handleIngredientChange(
                        ingredients,
                        setIngredients,
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="p-2 text-red-500 hover:text-red-700 transition duration-200 focus:outline-none"
                    aria-label="Remove Ingredient"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddIngredient}
              className="flex items-center mt-2 text-blue-500 hover:text-blue-700 transition duration-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Ingredient
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Steps</label>
            {steps.map((step, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={step}
                  onChange={(e) =>
                    handleStepChange(steps, setSteps, index, e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveStep(index)}
                  className="p-2 text-red-500 hover:text-red-700 transition duration-200 focus:outline-none"
                  aria-label="Remove Step"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddStep}
              className="flex items-center mt-2 text-blue-500 hover:text-blue-700 transition duration-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Step
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Categories
            </label>
            {categories.map((category, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(index)}
                  className="p-2 text-red-500 hover:text-red-700 transition duration-200 focus:outline-none"
                  aria-label="Remove Category"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCategory}
              className="flex items-center mt-2 text-blue-500 hover:text-blue-700 transition duration-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Category
            </button>
          </div>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          <div className="flex justify-between space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 focus:outline-none"
            >
              Update Recipe
            </button>
            <button
              onClick={onClose}
              type="button"
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
