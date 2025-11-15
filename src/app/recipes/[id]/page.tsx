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

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipeById(id);
        if (!data) {
          router.push("/404");
        } else {
          setRecipe(data);
        }
      } catch (err) {
        console.error(err);
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id, router]);

  const handleGoBack = () => {
    const lastVisited = sessionStorage.getItem("lastVisitedPath");
    if (lastVisited && lastVisited !== pathname) {
      router.push(lastVisited);
    } else {
      router.push("/dashboard");
    }
  };

  if (loading) return <LoadingScreen />;
  if (!recipe) return null;

  return (
    <div className="min-h-[90vh] from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md border border-amber-200 rounded-2xl shadow-xl p-6 sm:p-10">
        <RecipeDisplay
          recipe={recipe}
          onGoBack={handleGoBack}
          onDeleteSuccess={() => router.push("/dashboard")}
        />
      </div>
    </div>
  );
}
