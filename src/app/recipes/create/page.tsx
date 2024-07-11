"use client";

import { createRecipe } from "@/lib/actions/recipe.action";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import ImageUpload from "@/app/components/ImageUpload";

const CreateRecipe = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [image, setImage] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [categories, setCategories] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const router = useRouter();

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
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
    setIngredients([...ingredients, ""]);
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

    try {
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
        // Reset form fields
        setTitle("");
        setDescription("");
        setCookTime("");
        setImage("");
        setIngredients([""]);
        setSteps([""]);
        setCategories([""]);
        setError(null);

        // Redirect to the new recipe page
        router.push(`/`);
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
              inputMode="numeric"
              pattern="^\d+$"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Image URL
            </label>
            {/* <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            /> */}
            <ImageUpload setImage={setImage} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Ingredients
            </label>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) =>
                    handleIngredientChange(index, e.target.value)
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
