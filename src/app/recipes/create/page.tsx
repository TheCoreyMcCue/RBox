"use client";

import { createRecipe } from "@/lib/actions/recipe.action";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import ImageUpload from "@/app/components/ImageUpload";

import { Ingredient } from "@/app/utils/types";
import { handleStepChange, handleIngredientChange } from "@/app/utils/helper";
import { unitOptions } from "@/app/utils/data";

const CreateRecipe = () => {
  // State variables for managing form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [image, setImage] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { amount: "", unit: "", name: "" },
  ]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [categories, setCategories] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const router = useRouter();

  // Function to handle changes in the categories list
  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
  };

  // Add a new ingredient input
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { amount: "", unit: "", name: "" }]);
  };

  // Add a new step input
  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  // Add a new category input
  const handleAddCategory = () => {
    setCategories([...categories, ""]);
  };

  // Remove an ingredient input by index
  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  // Remove a step input by index
  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  // Remove a category input by index
  const handleRemoveCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  // Submit the form and create a new recipe
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Call the createRecipe action with the form data
      const newRecipe = await createRecipe({
        creator: user?.id,
        title,
        description,
        cookTime,
        image,
        ingredients,
        steps,
        category: categories,
      });

      if (newRecipe) {
        // Reset form fields after successful submission
        setTitle("");
        setDescription("");
        setCookTime("");
        setImage("");
        setIngredients([{ amount: "", unit: "", name: "" }]);
        setSteps([""]);
        setCategories([""]);
        setError(null);

        // Redirect to the dashboard or another page
        router.push(`/dashboard`);
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      setError("Failed to create recipe. Please try again.");
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Create a New Recipe
        </h1>
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md"
        >
          {/* Title Input */}
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

          {/* Description Input */}
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

          {/* Cook Time Input */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Cook Time (minutes)
            </label>
            <input
              type="text"
              inputMode="decimal"
              pattern="^(?:\d+(?:[.,]?\d*)?|\d+\s*\/\s*\d+)$"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Image URL
            </label>
            <ImageUpload setImage={setImage} />
          </div>

          {/* Ingredients Section */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Ingredients
            </label>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center mb-2">
                  {/* Amount Input */}
                  <input
                    type="text"
                    value={ingredient.amount}
                    placeholder="Qty"
                    onChange={
                      (e) =>
                        handleIngredientChange(
                          ingredients,
                          setIngredients,
                          index,
                          "amount",
                          e.target.value
                        ) // Use the refactored function
                    }
                    className="w-1/3 px-3 py-2 mr-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />

                  {/* Unit Dropdown */}
                  <select
                    value={ingredient.unit}
                    onChange={
                      (e) =>
                        handleIngredientChange(
                          ingredients,
                          setIngredients,
                          index,
                          "unit",
                          e.target.value
                        ) // Use the refactored function
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

                  {/* Ingredient Name Input */}
                  <input
                    type="text"
                    value={ingredient.name}
                    placeholder="Ingredient"
                    onChange={
                      (e) =>
                        handleIngredientChange(
                          ingredients,
                          setIngredients,
                          index,
                          "name",
                          e.target.value
                        ) // Use the refactored function
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />

                  {/* Remove Ingredient Button */}
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

          {/* Steps Section */}
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

          {/* Categories Section */}
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

          {/* Error Message */}
          {error && <div className="mb-4 text-red-500">{error}</div>}

          {/* Form Actions */}
          <div className="flex justify-between space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 focus:outline-none"
            >
              Create Recipe
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateRecipe;
