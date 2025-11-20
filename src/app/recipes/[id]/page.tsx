// app/recipes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getRecipeById } from "@/lib/actions/recipe.action";
import LoadingScreen from "@/app/components/LoadingScreen";
import RecipeDisplay from "@/app/components/RecipeDisplay";
import { Recipe } from "@/app/utils/types";

export default function RecipePage() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split("/")[2];

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH RECIPE ----------------
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipeById(id);
        if (!data) router.push("/404");
        else setRecipe(data);
      } catch {
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, router]);

  // ---------------- SMART BACK BUTTON ----------------
  const handleGoBack = () => {
    const last = sessionStorage.getItem("lastVisitedPath");

    if (last && last !== pathname) {
      router.push(last);
      return;
    }

    router.back(); // true browser back
  };

  // ---------------- RENDER ----------------
  if (loading) return <LoadingScreen message="loading recipe" />;
  if (!recipe) return null;

  console.log("lastVisitedPath =", sessionStorage.getItem("lastVisitedPath"));
  console.log("pathname =", pathname);

  return (
    <div className="min-h-[90vh] from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center py-6 px-4 sm:px-8">
      {/* THE DISPLAY AREA */}
      <div className="max-w-4xl mx-auto">
        <RecipeDisplay
          recipe={recipe}
          onGoBack={handleGoBack}
          onDeleteSuccess={() => router.push("/my-cookbook")}
        />
      </div>

      {/* 🔥 REQUIRED FOR MODALS — DO NOT REMOVE */}
      <div id="modal-root" />
    </div>
  );
}
