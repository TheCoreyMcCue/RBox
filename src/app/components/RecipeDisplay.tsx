"use client";

import Image from "next/image";
import Placeholder from "../../../public/placeholder.png";
import { Recipe } from "@/app/utils/types";
import DeleteModal from "@/app/components/DeleteModal";
import EditModal from "@/app/components/EditModal";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { deleteRecipe } from "@/lib/actions/recipe.action";

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
  const router = useRouter();
  const { data: session } = useSession();
  const clerkId = (session?.user as any)?.clerkId;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwner =
    typeof clerkId === "string" &&
    typeof recipe.creator === "string" &&
    clerkId.trim().toLowerCase() === recipe.creator.trim().toLowerCase();

  const handleDelete = async () => {
    if (!isOwner) {
      alert("You are not the owner of this recipe.");
      return;
    }

    try {
      await deleteRecipe(recipe._id);
      if (onDeleteSuccess) onDeleteSuccess();
      else router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Something went wrong while deleting.");
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("Recipe link copied to clipboard!");
    });
  };

  return (
    <div className="from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center py-10 px-4 sm:px-8">
      {onGoBack && (
        <div className="max-w-5xl mx-auto mb-6">
          <button
            type="button"
            onClick={onGoBack}
            className="flex items-center gap-2 px-4 py-2 text-sm text-amber-800 bg-amber-100 border border-amber-200 rounded-full hover:bg-amber-200 transition-colors shadow-sm"
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
        </div>
      )}

      <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-sm border border-amber-200 rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
        <Image
          src={recipe.image || Placeholder}
          alt={recipe.title}
          height={800}
          width={1200}
          className="w-full h-80 object-cover border-b border-amber-200"
        />

        <div className="p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-4xl font-[Homemade Apple] text-amber-800 mb-4 sm:mb-0">
              {recipe.title}
            </h1>
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
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
              <span className="text-sm font-medium">Share Recipe</span>
            </button>
          </div>

          <p className="text-lg text-amber-800 font-serif mb-6 leading-relaxed">
            {recipe.description}
          </p>

          <p className="text-sm font-semibold text-amber-600 mb-8">
            Cook Time: {recipe.cookTime} minutes
          </p>

          <h2 className="text-2xl font-semibold mb-3 text-amber-800">
            Ingredients
          </h2>
          <ul className="list-disc list-inside mb-8 text-amber-700 space-y-1 font-serif">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.amount} {ingredient.unit || ""} - {ingredient.name}
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-semibold mb-3 text-amber-800">Steps</h2>
          <ol className="list-decimal list-inside mb-8 text-amber-700 space-y-2 font-serif">
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>

          <h2 className="text-xl font-semibold mb-3 text-amber-800">
            Categories
          </h2>
          <ul className="flex flex-wrap gap-2 mb-8">
            {recipe.category.map((category, index) => (
              <li
                key={index}
                className="text-sm bg-amber-100 border border-amber-200 px-3 py-1 rounded-full text-amber-700"
              >
                {category}
              </li>
            ))}
          </ul>

          {isOwner && (
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                ✎ Edit
              </button>
            </div>
          )}
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
