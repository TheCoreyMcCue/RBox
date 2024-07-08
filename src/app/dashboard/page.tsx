"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getRecipesByUser, deleteRecipe } from "@/lib/actions/recipe.action";
import Link from "next/link";

interface Recipe {
  _id: string;
  title: string;
  description: string;
  image: string;
  cookTime: string;
  // add other necessary fields
}

const Dashboard = () => {
  const { user } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (user) {
        try {
          const fetchedRecipes = await getRecipesByUser(user.id);
          setRecipes(fetchedRecipes);
        } catch (error) {
          console.error("Error fetching recipes:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRecipes();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center">
        <h1 className="text-2xl font-bold">
          Please sign in to view your recipes
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Recipes</h1>
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <div key={recipe._id}>
              <Link href={`/recipes/${recipe._id}`}>
                <div className="block bg-white shadow-lg rounded-lg overflow-hidden transform transition-transform hover:scale-105 cursor-pointer">
                  <img
                    src={recipe.image || "https://via.placeholder.com/400x300"}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-2xl font-semibold mb-2">
                      {recipe.title}
                    </h2>
                    <p className="text-gray-700">{recipe.description}</p>
                    <p className="text-gray-500 mt-2">
                      Cook Time: {recipe.cookTime} minutes
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-700">No recipes found.</p>
      )}
    </div>
  );
};

export default Dashboard;
