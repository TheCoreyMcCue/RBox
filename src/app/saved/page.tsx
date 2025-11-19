"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getSavedRecipes } from "@/lib/actions/user.action";
import { getRecipeById } from "@/lib/actions/recipe.action";
import Link from "next/link";
import Image from "next/image";
import Placeholder from "../../../public/placeholder.png";

export default function SavedRecipesPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?._id || (session?.user as any)?.clerkId;

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------- LOAD SAVED IDS ----------------
  useEffect(() => {
    const loadSaved = async () => {
      if (!userId) return;
      const ids = await getSavedRecipes(userId);
      setSavedIds(Array.isArray(ids) ? ids : []);
    };
    loadSaved();
  }, [userId]);

  // ---------------- LOAD RECIPE DATA ----------------
  useEffect(() => {
    const loadRecipes = async () => {
      if (savedIds.length === 0) {
        setLoading(false);
        return;
      }

      const recipePromises = savedIds.map((id) => getRecipeById(id));
      const results = await Promise.all(recipePromises);

      // filter out null or deleted recipes
      setRecipes(results.filter(Boolean));
      setLoading(false);
    };

    loadRecipes();
  }, [savedIds]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-amber-700 font-serif">
        Loading saved recipes...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-[Homemade Apple] text-amber-800 mb-4">
          Please sign in to view your saved recipes
        </h1>
        <Link href="/" className="text-amber-700 underline font-serif">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center px-6 py-12">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-[Homemade Apple] text-amber-800 drop-shadow">
          Saved Recipes ⭐
        </h1>
        <p className="font-serif text-amber-700 mt-2">
          All your bookmarked favorites in one place
        </p>
      </div>

      {/* EMPTY STATE */}
      {savedIds.length === 0 || recipes.length === 0 ? (
        <div className="text-center text-amber-700 font-serif mt-16">
          <p className="text-xl">You have not saved any recipes yet.</p>
          <Link
            href="/discover"
            className="underline text-amber-800 text-lg block mt-4"
          >
            Discover new recipes
          </Link>
        </div>
      ) : (
        <>
          {/* GRID OF SAVED RECIPES */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {recipes.map((recipe) => (
              <Link key={recipe._id} href={`/recipes/${recipe._id}`}>
                <div className="bg-white/90 border border-amber-200 rounded-3xl overflow-hidden shadow hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer backdrop-blur-sm">
                  <Image
                    src={recipe.image || Placeholder}
                    alt={recipe.title}
                    width={500}
                    height={300}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-amber-800 line-clamp-1">
                      {recipe.title}
                    </h3>
                    <p className="text-amber-700/80 mt-2 line-clamp-2 font-serif">
                      {recipe.description}
                    </p>
                    <p className="text-sm text-amber-600 mt-4">
                      Cook Time: {recipe.cookTime} minutes
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
