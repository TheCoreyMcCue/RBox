import { useState } from "react";
import { useRouter } from "next/navigation"; // Use next/router instead of next/navigation
import { updateRecipe } from "@/lib/actions/recipe.action";

import { useUser } from "@clerk/nextjs";
import ImageUpload from "./ImageUpload";

interface Ingredient {
  amount: string;
  unit: string;
  name: string;
}

interface Recipe {
  _id: string;
  title: string;
  creator: string;
  description: string;
  image: string;
  cookTime: string;
  ingredients: Ingredient[];
  steps: string[];
  category: string[]; // Update to categories
}

interface EditModalProps {
  onClose: () => void;
  recipe: Recipe;
}

const EditModal: React.FC<EditModalProps> = ({ onClose, recipe }) => {
  const router = useRouter();

  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description);
  const [cookTime, setCookTime] = useState(recipe.cookTime);
  const [image, setImage] = useState(recipe.image);

  // Update the type to Ingredient[]
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe.ingredients
  );

  const [steps, setSteps] = useState<string[]>(recipe.steps);
  const [categories, setCategories] = useState<string[]>(recipe.category);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();

  // Handle changes to individual ingredient fields
  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value,
    };
    setIngredients(newIngredients);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
  };

  const handleAddIngredient = () => {
    // Add an empty ingredient object
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

    if (user?.id == recipe?.creator) {
      try {
        const updatedRecipe = await updateRecipe(recipe._id, {
          creator: user?.id,
          title: title,
          description: description,
          cookTime: cookTime,
          image: image,
          ingredients: ingredients,
          steps: steps,
          categories: categories, // Update to categories
        });

        // Handle success message or any additional logic here
        console.log("Recipe updated successfully:", updatedRecipe);
      } catch (error) {
        console.error("Error updating recipe:", error);
        setError("Failed to update recipe. Please try again.");
      }
      router.push("/dashboard");
    } else {
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
              pattern="^\d*\.?\d+|\d+\s*/\s*\d+$"
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
                    inputMode="decimal"
                    pattern="^\d*\.?\d+|\d+\s*/\s*\d+$"
                    onChange={(e) =>
                      handleIngredientChange(index, "amount", e.target.value)
                    }
                    className="w-1/3 px-3 py-2 mr-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={ingredient.unit}
                    placeholder="Unit"
                    onChange={(e) =>
                      handleIngredientChange(index, "unit", e.target.value)
                    }
                    className="w-1/3 px-3 py-2 mr-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={ingredient.name}
                    placeholder="Ingredient"
                    onChange={(e) =>
                      handleIngredientChange(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    &minus;
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddIngredient}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
            >
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
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveStep(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  &minus;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddStep}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
            >
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
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  &minus;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCategory}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Add Category
            </button>
          </div>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          <div className="w-full flex justify-around">
            <button
              type="submit"
              className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Update Recipe
            </button>
            <button
              onClick={() => onClose()}
              className="bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition duration-300"
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
