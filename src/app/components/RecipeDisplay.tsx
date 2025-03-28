"use client";

import Image from "next/image";
import Placeholder from "../../../public/placeholder.png";
import { Recipe } from "@/app/utils/types";
import DeleteModal from "@/app/components/DeleteModal";
import EditModal from "@/app/components/EditModal";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface RecipeDisplayProps {
  recipe: Recipe;
  onGoBack?: () => void;
  onDeleteSuccess?: () => void;
}

const RecipeDisplay = ({
  recipe,
  onGoBack,
  onDeleteSuccess,
}: RecipeDisplayProps) => {
  const { user } = useUser();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    if (recipe && user?.id === recipe.creator) {
      try {
        const res = await fetch("/api/recipe/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipeId: recipe._id,
            creatorId: recipe.creator,
          }),
        });

        if (res.ok && onDeleteSuccess) {
          onDeleteSuccess();
        }
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    } else {
      alert("This isn't your recipe, silly.");
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("Recipe copied to clipboard!");
    });
  };

  return (
    <div className="min-h-[90vh] bg-gray-50 py-8">
      {onGoBack && (
        <button
          type="button"
          onClick={onGoBack}
          className="w-full flex items-center justify-center px-5 py-5 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto hover:bg-gray-100"
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
      )}
      <div className="container mx-auto px-4">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 ease-in-out transform hover:shadow-2xl">
          <Image
            src={recipe.image || Placeholder}
            alt={recipe.title}
            height={1200}
            width={1200}
            className="w-full h-72 object-cover"
          />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-800">
                {recipe.title}
              </h1>
              <button
                onClick={handleCopyUrl}
                className="ml-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V3.75A2.25 2.25 0 0013.5 1.5h-9A2.25 2.25 0 002.25 3.75v9a2.25 2.25 0 002.25 2.25H9M7.5 7.5h9m3 3V20.25A2.25 2.25 0 0117.25 22.5h-9A2.25 2.25 0 016 20.25v-9A2.25 2.25 0 018.25 9H15"
                  />
                </svg>
                <p className="text-xs">Share Recipe</p>
              </button>
            </div>
            <p className="text-lg text-gray-700 mb-6">{recipe.description}</p>
            <p className="text-sm font-semibold text-gray-500 mb-6">
              Cook Time: {recipe.cookTime} minutes
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Ingredients
            </h2>
            <ul className="list-disc list-inside mb-6 text-gray-700">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.amount} {ingredient.unit || ""} -{" "}
                  {ingredient.name}
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
            <div className="w-full flex justify-between">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              >
                ✎ Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditModal recipe={recipe} onClose={() => setShowEditModal(false)} />
      )}
      {showDeleteModal && (
        <DeleteModal
          handleDelete={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default RecipeDisplay;
