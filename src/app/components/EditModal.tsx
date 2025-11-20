"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateRecipe } from "@/lib/actions/recipe.action";
import ImageUpload from "./ImageUpload";
import { Ingredient, Recipe } from "../utils/types";
import { handleStepChange, handleIngredientChange } from "@/app/utils/helper";
import { unitOptions } from "../utils/data";
import { CATEGORY_OPTIONS } from "../utils/data";

interface EditModalProps {
  onClose: () => void;
  recipe: Recipe;
}

const EditModal: React.FC<EditModalProps> = ({ onClose, recipe }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as any)?._id || (session?.user as any)?.clerkId;

  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description);
  const [cookTime, setCookTime] = useState(recipe.cookTime);
  const [image, setImage] = useState(recipe.image);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe.ingredients
  );
  const [steps, setSteps] = useState<string[]>(recipe.steps);

  // IMPORTANT: Updated key — recipe now stores recipe.categories
  const [categories, setCategories] = useState<string[]>(
    recipe.categories || []
  );

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const [error, setError] = useState<string | null>(null);

  const handleCategoryChange = (index: number, value: string) => {
    const updated = [...categories];
    updated[index] = value;
    setCategories(updated);
  };

  const handleAddCategory = () => {
    setCategories([...categories, ""]);
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError("You must be signed in to update a recipe.");
      return;
    }

    try {
      const updatedRecipe = await updateRecipe(recipe._id, {
        creator: userId,
        title,
        description,
        cookTime,
        image,
        ingredients,
        steps,
        categories, // ✅ FIXED — use correct field name
      });

      console.log("Recipe updated:", updatedRecipe);
      router.push("/my-cookbook");
    } catch (error) {
      console.error("Error updating recipe:", error);
      setError("Failed to update recipe. Please try again.");
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-2 sm:px-0">
      <div className="bg-amber-50/95 border border-amber-200 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-3xl font-[Homemade Apple] text-amber-800 mb-6 text-center">
          ✎ Edit Your Recipe
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block font-semibold mb-2 text-amber-800">
              Recipe Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-amber-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-2 text-amber-800">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-amber-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>

          {/* Cook Time */}
          <div>
            <label className="block font-semibold mb-2 text-amber-800">
              Cook Time (minutes)
            </label>
            <input
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              className="w-full px-4 py-3 border border-amber-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-semibold mb-3 text-amber-800">
              Recipe Image
            </label>
            <ImageUpload setImage={setImage} />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block font-semibold mb-3 text-amber-800">
              Ingredients
            </label>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
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
                  className="w-full sm:w-1/4 px-3 py-2 border border-amber-200 rounded-lg"
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
                  className="w-full sm:w-1/4 px-3 py-2 border border-amber-200 rounded-lg"
                >
                  <option value="" disabled>
                    Select Unit
                  </option>
                  {unitOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
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
                  className="w-full sm:flex-1 px-3 py-2 border border-amber-200 rounded-lg"
                  required
                />

                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  className="text-red-600 font-bold hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setIngredients([
                  ...ingredients,
                  { amount: "", unit: "", name: "" },
                ])
              }
              className="mt-3 text-amber-700 hover:underline"
            >
              ➕ Add Ingredient
            </button>
          </div>

          {/* Steps */}
          <div>
            <label className="block font-semibold mb-3 text-amber-800">
              Steps
            </label>
            {steps.map((step, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={step}
                  onChange={(e) =>
                    handleStepChange(steps, setSteps, index, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveStep(index)}
                  className="ml-2 text-red-600 font-bold hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setSteps([...steps, ""])}
              className="mt-3 text-amber-700 hover:underline"
            >
              ➕ Add Step
            </button>
          </div>

          {/* Categories */}
          <div>
            <label className="block font-semibold mb-3 text-amber-800">
              Categories
            </label>

            {categories.map((category, index) => (
              <div key={index} className="flex items-center gap-3 mb-3">
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white"
                >
                  <option value="">Select a category</option>

                  {Object.entries(CATEGORY_OPTIONS).map(([group, opts]) => (
                    <optgroup
                      key={group}
                      label={group
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (s) => s.toUpperCase())}
                    >
                      {opts.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleRemoveCategory(index)}
                  className="text-red-600 font-bold hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddCategory}
              className="mt-3 text-amber-700 hover:underline"
            >
              ➕ Add Category
            </button>
          </div>

          {/* Errors */}
          {error && <div className="text-red-600 font-medium">{error}</div>}

          {/* Buttons */}
          <div className="flex justify-between gap-4 mt-8">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-full text-lg font-semibold hover:from-amber-700 hover:to-amber-800 shadow-md"
            >
              💾 Save Changes
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-amber-200 text-amber-800 py-3 rounded-full text-lg font-semibold hover:bg-amber-300"
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
