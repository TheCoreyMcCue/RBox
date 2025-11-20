"use client";

import Image from "next/image";
import Placeholder from "../../../public/placeholder.png";
import { createPortal } from "react-dom";
import { Recipe } from "@/app/utils/types";
import DeleteModal from "@/app/components/DeleteModal";
import EditModal from "@/app/components/EditModal";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { deleteRecipe } from "@/lib/actions/recipe.action";
import {
  saveRecipe,
  unsaveRecipe,
  getSavedRecipes,
} from "@/lib/actions/user.action";

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

  const userId = (session?.user as any)?._id;
  const clerkId = (session?.user as any)?.clerkId;

  const recipeCreator = recipe.creator?.toString?.() ?? "";
  const recipeClerk = (recipe as any)?.creatorClerkId?.toString?.() ?? "";

  const isOwner =
    (!!userId && recipeCreator === String(userId)) ||
    (!!clerkId && (recipeCreator === clerkId || recipeClerk === clerkId));

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [useMetric, setUseMetric] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load saved status
  useEffect(() => {
    const checkSaved = async () => {
      if (!userId) return;
      const saved = await getSavedRecipes(userId);
      if (Array.isArray(saved) && saved.includes(recipe._id)) {
        setIsSaved(true);
      }
    };
    checkSaved();
  }, [userId, recipe._id]);

  const handleSave = async () => {
    if (!userId) return;
    await saveRecipe(userId, recipe._id);
    setIsSaved(true);
  };

  const handleUnsave = async () => {
    if (!userId) return;
    await unsaveRecipe(userId, recipe._id);
    setIsSaved(false);
  };

  const handleDelete = async () => {
    if (!isOwner) {
      alert("You are not the owner of this recipe.");
      return;
    }
    try {
      await deleteRecipe(recipe._id);
      if (onDeleteSuccess) onDeleteSuccess();
      else router.push("/dashboard");
    } catch {
      alert("Something went wrong.");
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Unit conversion helpers
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
      {/* GO BACK BUTTON */}
      {onGoBack && (
        <div className="max-w-5xl mx-auto mb-6">
          <button
            type="button"
            onClick={onGoBack}
            className="flex items-center gap-2 px-4 py-2 text-sm text-amber-800 bg-amber-100/70 border border-amber-200 rounded-full hover:bg-amber-200 transition shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                d="M6.75 15.75 3 12l3.75-3.75M3 12h18"
              />
            </svg>
            Go back
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto bg-amber-50/80 border border-amber-200 rounded-2xl shadow-md overflow-hidden">
        <Image
          src={recipe.image || Placeholder}
          alt={recipe.title}
          height={800}
          width={1200}
          className="w-full h-80 object-cover border-b border-amber-200"
        />

        <div className="p-8 sm:p-10">
          {/* HEADER AREA */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
            <h1 className="text-4xl font-[Homemade Apple] text-amber-800">
              {recipe.title}
            </h1>

            {/* BUTTON WRAPPER — NOW WRAPS ON MOBILE */}
            <div className="flex flex-wrap gap-3 justify-start sm:justify-end">
              {/* Copy button */}
              <button
                onClick={handleCopyUrl}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm transition ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-white/60 text-amber-800 hover:bg-white/80"
                }`}
              >
                {copied ? "Copied ✓" : "Share"}
              </button>

              {/* Save button — FIXED SIZE + ALWAYS VISIBLE */}
              {!isOwner && userId && (
                <button
                  onClick={isSaved ? handleUnsave : handleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm transition ${
                    isSaved
                      ? "bg-amber-400 hover:bg-amber-500 text-white"
                      : "bg-amber-700 hover:bg-amber-800 text-white"
                  }`}
                >
                  {isSaved ? "Saved ✓" : "Save +"}
                </button>
              )}
              {/* Unit toggle */}
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-white/60 px-3 py-2 rounded-full shadow-sm">
                <span>Imperial</span>
                <label className="relative inline-flex cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useMetric}
                    onChange={() => setUseMetric(!useMetric)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-amber-200 rounded-full peer-checked:bg-amber-600 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                </label>
                <span>Metric</span>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <p className="text-lg font-serif text-amber-800/90 mb-6 leading-relaxed">
            {recipe.description}
          </p>

          <p className="text-sm font-semibold text-amber-700 mb-8">
            Cook Time: {recipe.cookTime} minutes
          </p>

          {/* INGREDIENTS */}
          <h2 className="text-2xl font-semibold text-amber-800 mb-3">
            Ingredients
          </h2>

          <ul className="list-disc list-inside text-amber-700/90 font-serif space-y-1 mb-8">
            {recipe.ingredients.map((ing, i) => {
              const amount = parseFloat(ing.amount);
              const unit = ing.unit;

              const finalAmt =
                !isNaN(amount) && useMetric
                  ? isRecipeMetric
                    ? `${amount} ${unit}`
                    : convertToMetric(amount, unit)
                  : !isNaN(amount) && !useMetric
                  ? isRecipeMetric
                    ? convertToImperial(amount, unit)
                    : `${amount} ${unit}`
                  : `${ing.amount} ${unit || ""}`;

              return (
                <li key={i}>
                  {finalAmt} — {ing.name}
                </li>
              );
            })}
          </ul>

          {/* STEPS */}
          <h2 className="text-2xl font-semibold text-amber-800 mb-3">Steps</h2>

          <ol className="list-decimal list-inside text-amber-700/90 font-serif space-y-2 mb-8">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          {/* CATEGORIES */}
          <h2 className="text-xl font-semibold text-amber-800 mb-3">
            Categories
          </h2>

          <ul className="flex flex-wrap gap-2 mb-10">
            {recipe.categories?.map((cat, i) => (
              <li
                key={i}
                className="px-3 py-1 bg-amber-100/70 border border-amber-200 rounded-full text-sm text-amber-700"
              >
                {cat}
              </li>
            ))}
          </ul>

          {/* OWNER CONTROLS */}
          {isOwner && (
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white shadow hover:from-red-600 hover:to-red-800 transition"
              >
                Delete
              </button>

              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow hover:from-amber-700 hover:to-amber-600 transition"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {showEditModal &&
        createPortal(
          <EditModal recipe={recipe} onClose={() => setShowEditModal(false)} />,
          document.getElementById("modal-root")!
        )}

      {showDeleteModal &&
        createPortal(
          <DeleteModal
            handleDelete={handleDelete}
            onClose={() => setShowDeleteModal(false)}
          />,
          document.getElementById("modal-root")!
        )}
    </div>
  );
};

export default RecipeDisplay;
