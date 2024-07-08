// pages/recipes/[id].tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getRecipeById } from "@/lib/actions/recipe.action";
import Link from "next/link";
import EditModal from "@/app/components/EditModal"; // Adjust path as per your project structure

interface Recipe {
  _id: string;
  title: string;
  description: string;
  image: string;
  cookTime: string;
  ingredients: string[];
  steps: string[];
  category: string;
}

const RecipeDetails = () => {
  const router = useRouter();
  const pathname = usePathname();
  const recipeId = useSearchParams();
  const [id, setId] = useState(pathname.split("/")[2]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (id) {
        try {
          const fetchedRecipe = await getRecipeById(id as string);
          if (!fetchedRecipe) {
            router.push("/404"); // Redirect to 404 page if recipe not found
          } else {
            setRecipe(fetchedRecipe);
          }
        } catch (error) {
          console.error("Error fetching recipe:", error);
          router.push("/404");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRecipe();
  }, [id, router]);

  const openEditModal = () => {
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center">
        <h1 className="text-2xl font-bold">Recipe not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">{recipe.title}</h1>
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <img
          src={recipe.image || "https://via.placeholder.com/400x300"}
          alt={recipe.title}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <p className="text-gray-700 mb-4">{recipe.description}</p>
          <p className="text-gray-500 mb-4">
            Cook Time: {recipe.cookTime} minutes
          </p>
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="list-disc list-inside mb-4">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
          <h2 className="text-2xl font-semibold mb-4">Steps</h2>
          <ol className="list-decimal list-inside mb-4">
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <h2 className="text-2xl font-semibold mb-4">Category</h2>
          <p className="text-gray-500">{recipe.category}</p>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-green-500 text-white px-4 py-2 rounded-lg  hover:bg-blue-600"
            >
              ⬅️ Back to Dashboard
            </button>
            <button
              onClick={openEditModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
      {showEditModal && <EditModal recipe={recipe} onClose={closeEditModal} />}
    </div>
  );
};

export default RecipeDetails;
