"use client";

import { usePathname, useRouter } from "next/navigation";
import { Recipe } from "@/app/utils/types";
import RecipeDisplay from "@/app/components/RecipeDisplay";

interface RecipeClientProps {
  recipe: Recipe;
}

export default function RecipeClient({ recipe }: RecipeClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Smart "back" behavior using lastVisitedPath
  const handleGoBack = () => {
    const last = sessionStorage.getItem("lastVisitedPath");

    if (last && last !== pathname) {
      router.push(last);
      return;
    }

    // Fallback: true browser back
    router.back();
  };

  return (
    <RecipeDisplay
      recipe={recipe}
      onGoBack={handleGoBack}
      // After delete, always go back to "My Cookbook"
      onDeleteSuccess={() => router.push("/my-cookbook")}
    />
  );
}
