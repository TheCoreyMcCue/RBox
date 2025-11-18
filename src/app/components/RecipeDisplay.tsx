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

  // Unified identifiers for both Clerk and NextAuth users
  const userId = (session?.user as any)?._id;
  const clerkId = (session?.user as any)?.clerkId;

  const recipeCreator = recipe.creator?.toString?.() ?? "";
  const recipeClerk = (recipe as any)?.creatorClerkId?.toString?.() ?? "";

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [useMetric, setUseMetric] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);

  // Strict hybrid ownership check
  const isOwner =
    (!!userId && recipeCreator === userId.toString()) ||
    (!!clerkId && (recipeCreator === clerkId || recipeClerk === clerkId));

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

  // NEW: Toast-based copy notification
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000); // auto-hide after 2s
    });
  };

  // Conversion helpers (unchanged)
  const convertToMetric = (amount: number, unit: string) => {
    switch (unit.toLowerCase()) {
      case "cup":
      case "cups":
        return `${(amount * 240).toFixed(0)} ml`;
      case "tbsp":
      case "tablespoon":
      case "tablespoons":
        return `${(amount * 15).toFixed(0)} ml`;
      case "tsp":
      case "teaspoon":
      case "teaspoons":
        return `${(amount * 5).toFixed(0)} ml`;
      case "oz":
      case "ounce":
      case "ounces":
        return `${(amount * 28.35).toFixed(0)} g`;
      case "lb":
      case "pound":
      case "pounds":
        return `${(amount * 453.6).toFixed(0)} g`;
      default:
        return `${amount} ${unit}`;
    }
  };

  const convertToImperial = (amount: number, unit: string) => {
    switch (unit.toLowerCase()) {
      case "ml":
      case "milliliter":
      case "milliliters":
        return `${(amount / 240).toFixed(2)} cups`;
      case "l":
      case "liter":
      case "liters":
        return `${(amount * 4.167).toFixed(2)} cups`;
      case "g":
      case "gram":
      case "grams":
        return `${(amount / 28.35).toFixed(2)} oz`;
      case "kg":
      case "kilogram":
      case "kilograms":
        return `${(amount * 2.205).toFixed(2)} lb`;
      default:
        return `${amount} ${unit}`;
    }
  };

  const isRecipeMetric = recipe.ingredients.some((ingredient) => {
    const u = ingredient.unit?.toLowerCase();
    return ["g", "gram", "grams", "kg", "ml", "l", "liter", "liters"].includes(
      u || ""
    );
  });

  return (
    <div className="relative from-amber-50 via-amber-100/80 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center py-10 px-4 sm:px-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[5000] bg-amber-600 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-fade-in-out">
          📋 Link copied to clipboard!
        </div>
      )}

      {onGoBack && (
        <div className="max-w-5xl mx-auto mb-6">
          <button
            type="button"
            onClick={onGoBack}
            className="flex items-center gap-2 px-4 py-2 text-sm text-amber-800 bg-amber-100/70 border border-amber-200 rounded-full hover:bg-amber-200 transition-colors shadow-sm"
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

      <div className="max-w-5xl mx-auto bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-2xl shadow-md overflow-hidden transition-all duration-300">
        <Image
          src={recipe.image || Placeholder}
          alt={recipe.title}
          height={800}
          width={1200}
          className="w-full h-80 object-cover border-b border-amber-200"
        />

        <div className="p-8 sm:p-10">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-4xl font-[Homemade Apple] text-amber-800 mb-4 sm:mb-0">
              {recipe.title}
            </h1>

            <div className="flex items-center gap-4">
              {/* Imperial/Metric toggle */}
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <span>Imperial</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useMetric}
                    onChange={() => setUseMetric(!useMetric)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-amber-200 rounded-full peer peer-checked:bg-amber-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
                <span>Metric</span>
              </div>

              {/* Share button */}
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    d="M12.293 2.293a1 1 0 011.414 0l4 
                  4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 
                  8H9a5 5 0 00-5 5v3a1 1 0 11-2 
                  0v-3a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 
                  010-1.414z"
                  />
                </svg>
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-amber-800/90 font-serif mb-6 leading-relaxed">
            {recipe.description}
          </p>

          {/* Cook time */}
          <p className="text-sm font-semibold text-amber-700 mb-8">
            Cook Time: {recipe.cookTime} minutes
          </p>

          {/* Ingredients */}
          <h2 className="text-2xl font-semibold mb-3 text-amber-800">
            Ingredients
          </h2>
          <ul className="list-disc list-inside mb-8 text-amber-700/90 space-y-1 font-serif">
            {recipe.ingredients.map((ingredient, index) => {
              const amount = parseFloat(ingredient.amount as any);
              const unit = ingredient.unit || "";
              const displayAmount =
                !isNaN(amount) && useMetric
                  ? isRecipeMetric
                    ? `${amount} ${unit}`
                    : convertToMetric(amount, unit)
                  : !isNaN(amount) && !useMetric
                  ? isRecipeMetric
                    ? convertToImperial(amount, unit)
                    : `${amount} ${unit}`
                  : `${ingredient.amount} ${ingredient.unit || ""}`;

              return (
                <li key={index}>
                  {displayAmount} — {ingredient.name}
                </li>
              );
            })}
          </ul>

          {/* Steps */}
          <h2 className="text-2xl font-semibold mb-3 text-amber-800">Steps</h2>
          <ol className="list-decimal list-inside mb-8 text-amber-700/90 space-y-2 font-serif">
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>

          {/* Categories */}
          <h2 className="text-xl font-semibold mb-3 text-amber-800">
            Categories
          </h2>
          <ul className="flex flex-wrap gap-2 mb-8">
            {recipe.category.map((category, index) => (
              <li
                key={index}
                className="text-sm bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full text-amber-700"
              >
                {category}
              </li>
            ))}
          </ul>

          {/* Edit/Delete Buttons */}
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
