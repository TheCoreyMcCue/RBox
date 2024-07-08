// pages/recipes/[id].tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getRecipeById, deleteRecipe } from "@/lib/actions/recipe.action";

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
  const [id, setId] = useState(pathname.split("/")[2]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const handleDelete = async (recipeId: string) => {
    try {
      await deleteRecipe(recipeId, user!.id);
      setRecipes(recipes.filter((recipe) => recipe._id !== recipeId));
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

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
          <div
            className="text-blue-500 hover:underline mt-4 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </div>
          <button
            onClick={() => handleDelete(recipe._id)}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300 mt-2 mx-4"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
