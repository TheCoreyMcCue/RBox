"use client";

import { createRecipe } from "@/lib/actions/recipe.action";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import ImageUpload from "@/app/components/ImageUpload";

import { Ingredient } from "@/app/utils/interface";
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

  // Function to handle changes in the ingredients list
  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  // Function to handle changes in the steps list
  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

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
              <div key={index} className="flex flex-wrap mb-2">
                <input
                  type="text"
                  placeholder="Qty"
                  value={ingredient.amount}
                  inputMode="decimal"
                  pattern="^(?:\d+(?:[.,]?\d*)?|\d+\s*\/\s*\d+)$"
                  onChange={(e) =>
                    handleIngredientChange(index, "amount", e.target.value)
                  }
                  className="w-1/5 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 mr-2 mb-2"
                  required
                />
                <select
                  value={ingredient.unit}
                  onChange={(e) =>
                    handleIngredientChange(index, "unit", e.target.value)
                  }
                  className="w-1/4 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 mr-2 mb-2"
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
                  placeholder="Name"
                  value={ingredient.name}
                  onChange={(e) =>
                    handleIngredientChange(index, "name", e.target.value)
                  }
                  className="w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 mb-2"
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
            ))}
            <button
              type="button"
              onClick={handleAddIngredient}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
            >
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

          {/* Error Message */}
          {error && <div className="mb-4 text-red-500">{error}</div>}

          {/* Form Actions */}
          <div className="w-full flex justify-around">
            <button
              type="submit"
              className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Create Recipe
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
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
