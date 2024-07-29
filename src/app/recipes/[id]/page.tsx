"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { getRecipeById, deleteRecipe } from "@/lib/actions/recipe.action";
import Image from "next/image";
import DeleteModal from "@/app/components/DeleteModal";
import EditModal from "@/app/components/EditModal";
import { Recipe } from "@/app/utils/types";
import Placeholder from "../../../../public/placeholder.png";

const RecipeDetails = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [id, setId] = useState(pathname.split("/")[2]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (recipe) {
      try {
        await deleteRecipe(recipe._id, recipe.creator);
        router.push("/dashboard"); // Navigate back to the dashboard after deletion
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce"></div>
          <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce delay-150"></div>
          <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce delay-300"></div>
        </div>
        <span className="mt-4 text-gray-600 text-lg">Loading Recipe...</span>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-600">Recipe not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-gray-50 py-8">
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="w-full flex items-center justify-center px-5 py-5 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700"
      >
        <svg
          className="w-5 h-5 rtl:rotate-180"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
          />
        </svg>
        <span>Go back</span>
      </button>
      <div className="container mx-auto px-4">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 ease-in-out transform hover:shadow-2xl">
          <Image
            src={recipe.image || Placeholder}
            alt={recipe.title}
            height={1200}
            width={1200}
            className="w-full h-72 object-cover transition-transform duration-300 ease-in-out transform hover:scale-105"
          />
          <div className="p-6">
            <h1 className="text-4xl font-bold mb-4 text-center text-gray-800 animate-fadeIn">
              {recipe.title}
            </h1>
            <p className="text-lg text-gray-700 mb-6">{recipe.description}</p>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm font-semibold text-gray-500">
                Cook Time: {recipe.cookTime} minutes
              </p>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Ingredients
            </h2>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.amount} {ingredient.unit} - {ingredient.name}
                </li>
              ))}
            </ul>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Steps</h2>
            <ol className="list-decimal list-inside mb-6 text-gray-700 space-y-2">
              {recipe.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Categories
            </h2>
            <ul className="flex flex-wrap gap-2 mb-6">
              {recipe.category.map((category, index) => (
                <li
                  key={index}
                  className="text-sm bg-gray-200 px-2 py-1 rounded-full text-gray-600"
                >
                  {category}
                </li>
              ))}
            </ul>
            <div className="flex justify-center"></div>
            <div className=" w-full flex justify-between">
              <button
                onClick={openDeleteModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
              >
                🗑️ Delete
              </button>
              <button
                onClick={openEditModal}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              >
                ✎ Edit
              </button>
            </div>
          </div>
        </div>
      </div>
      {showEditModal && <EditModal recipe={recipe} onClose={closeEditModal} />}
      {showDeleteModal && (
        <DeleteModal handleDelete={handleDelete} onClose={closeDeleteModal} />
      )}
    </div>
  );
};

export default RecipeDetails;
