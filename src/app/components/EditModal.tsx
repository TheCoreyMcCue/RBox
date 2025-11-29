"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ImageUpload from "./ImageUpload";
import { Ingredient, Recipe } from "../utils/types";
import { updateRecipe } from "@/lib/actions/recipe.action";
import { handleStepChange, handleIngredientChange } from "@/app/utils/helper";
import { unitOptions, CATEGORY_OPTIONS } from "@/app/utils/data";

interface EditModalProps {
  onClose: () => void;
  recipe: Recipe;
}

export default function EditModal({ onClose, recipe }: EditModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as any)?._id || (session?.user as any)?.clerkId;

  // State
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description);
  const [cookTime, setCookTime] = useState(recipe.cookTime);
  const [image, setImage] = useState(recipe.image);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe.ingredients
  );
  const [steps, setSteps] = useState<string[]>(recipe.steps);
  const [categories, setCategories] = useState<string[]>(
    recipe.categories || []
  );
  const [error, setError] = useState<string | null>(null);

  // Category helpers
  const handleCategoryChange = (index: number, value: string) => {
    const list = [...categories];
    list[index] = value;
    setCategories(list);
  };
  const addCategory = () => setCategories([...categories, ""]);
  const removeCategory = (index: number) =>
    setCategories(categories.filter((_, i) => i !== index));

  // Ingredient helpers
  const removeIngredient = (index: number) =>
    setIngredients(ingredients.filter((_, i) => i !== index));

  // Step helpers
  const removeStep = (index: number) =>
    setSteps(steps.filter((_, i) => i !== index));

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError("You must be signed in to edit a recipe.");
      return;
    }

    try {
      const payload = {
        creator: userId,
        title,
        description,
        cookTime,
        image,
        ingredients,
        steps,
        categories,
      };

      await updateRecipe(recipe._id, payload);
      router.push("/my-cookbook");
      setTimeout(() => {
        router.refresh();
      }, 50);
    } catch (err) {
      console.error(err);
      setError("Failed to update recipe.");
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/90 border border-amber-200 shadow-2xl p-6 sm:p-10 space-y-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl sm:text-4xl font-[Homemade Apple] text-amber-800">
            Edit Recipe ✎
          </h2>
          <button
            onClick={onClose}
            className="text-amber-700 hover:text-amber-900 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* TITLE / DESCRIPTION / TIME */}
          <div className="bg-white/80 rounded-3xl border border-amber-200 shadow-md p-6 sm:p-8 space-y-5">
            {/* Title */}
            <div>
              <label className="block font-serif text-amber-800 font-semibold mb-2">
                Recipe Title
              </label>
              <input
                className="w-full rounded-2xl p-3 bg-amber-50/60 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-serif text-amber-800 font-semibold mb-2">
                Description
              </label>
              <textarea
                className="w-full rounded-2xl p-3 bg-amber-50/60 border border-amber-200 resize-vertical focus:outline-none focus:ring-2 focus:ring-amber-400"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Time */}
            <div className="max-w-xs">
              <label className="block font-serif text-amber-800 font-semibold mb-2">
                Cook Time (minutes)
              </label>
              <input
                type="number"
                className="w-full rounded-2xl p-3 bg-amber-50/60 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* IMAGE UPLOAD */}
          <div className="bg-white/80 rounded-3xl border border-amber-200 shadow-md p-6 sm:p-8 space-y-4">
            <h3 className="text-xl font-[Homemade Apple] text-amber-800">
              Recipe Image 📷
            </h3>
            <ImageUpload setImage={setImage} />
          </div>

          {/* INGREDIENTS */}
          <div className="bg-white/80 rounded-3xl border border-amber-200 shadow-md p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-[Homemade Apple] text-amber-800">
                Ingredients 🥕
              </h3>
              <button
                type="button"
                onClick={() =>
                  setIngredients([
                    ...ingredients,
                    { amount: "", unit: "", name: "" },
                  ])
                }
                className="text-sm text-amber-700 underline hover:text-amber-900"
              >
                ➕ Add Ingredient
              </button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-2 bg-amber-50/60 border border-amber-200 rounded-2xl p-3"
                >
                  <input
                    value={ing.amount}
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
                    className="w-24 rounded-xl border border-amber-200 p-2 bg-white/80"
                  />

                  <select
                    value={ing.unit}
                    onChange={(e) =>
                      handleIngredientChange(
                        ingredients,
                        setIngredients,
                        index,
                        "unit",
                        e.target.value
                      )
                    }
                    className="w-full sm:w-32 rounded-xl border border-amber-200 p-2 bg-white/80"
                  >
                    <option value="">Unit</option>
                    {unitOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>

                  <input
                    value={ing.name}
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
                    className="flex-1 rounded-xl border border-amber-200 p-2 bg-white/80"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 font-bold text-lg px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* STEPS */}
          <div className="bg-white/80 rounded-3xl border border-amber-200 shadow-md p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-[Homemade Apple] text-amber-800">
                Steps 👩‍🍳
              </h3>
              <button
                type="button"
                onClick={() => setSteps([...steps, ""])}
                className="text-sm text-amber-700 underline hover:text-amber-900"
              >
                ➕ Add Step
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-start bg-amber-50/60 border border-amber-200 rounded-2xl p-3"
                >
                  <span className="font-semibold text-amber-700 mt-2">
                    {index + 1}.
                  </span>

                  <textarea
                    value={step}
                    onChange={(e) =>
                      handleStepChange(steps, setSteps, index, e.target.value)
                    }
                    rows={2}
                    className="flex-1 rounded-xl border border-amber-200 p-2 bg-white/80 resize-vertical"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="text-red-500 font-bold text-lg px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="bg-white/80 rounded-3xl border border-amber-200 shadow-md p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-[Homemade Apple] text-amber-800">
                Categories 🗂️
              </h3>
              <button
                type="button"
                onClick={addCategory}
                className="text-sm text-amber-700 underline hover:text-amber-900"
              >
                ➕ Add Category
              </button>
            </div>

            <div className="space-y-3">
              {categories.map((cat, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-center bg-amber-50/60 border border-amber-200 rounded-2xl p-3"
                >
                  <select
                    value={cat}
                    onChange={(e) =>
                      handleCategoryChange(index, e.target.value)
                    }
                    className="flex-1 rounded-xl border border-amber-200 p-2 bg-white/80"
                  >
                    <option value="">Select category</option>
                    {Object.entries(CATEGORY_OPTIONS).map(([group, opts]) => (
                      <optgroup
                        key={group}
                        label={group
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (s) => s.toUpperCase())}
                      >
                        {opts.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="text-red-500 font-bold text-lg px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-red-600 font-semibold">{error}</p>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-700 to-amber-600 py-3 rounded-full text-white font-semibold text-lg shadow-md hover:from-amber-800 hover:to-amber-700 transition"
            >
              Save Changes 💾
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white text-amber-800 border border-amber-300 py-3 rounded-full text-lg font-semibold shadow-sm hover:bg-amber-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Fade-in animation */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
