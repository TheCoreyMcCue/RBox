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

  if (loading) return <LoadingScreen />;
  if (!recipe) return null;

  return (
    <RecipeDisplay
      recipe={recipe}
      onGoBack={() => router.push("/dashboard")}
      onDeleteSuccess={() => router.push("/dashboard")}
    />
  );
}
