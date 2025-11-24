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

  // Simplified "back" behavior
  const handleGoBack = () => {
    router.back();
  };

  return (
    <RecipeDisplay
      recipe={recipe}
      onGoBack={handleGoBack}
      // After delete, always go back
      onDeleteSuccess={() => {
        router.back();
      }}
    />
  );
}
