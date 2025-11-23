// app/recipes/[id]/page.tsx
import { notFound } from "next/navigation";
import { getRecipeById } from "@/lib/actions/recipe.action";
import RecipeClient from "./RecipeClient";
import { Recipe } from "@/app/utils/types";

interface RecipePageProps {
  params: { id: string };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = params;

  // Fetch recipe on the server
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  // Ensure the recipe is serializable
  const serializedRecipe = JSON.parse(JSON.stringify(recipe)) as Recipe;

  return (
    <div className="min-h-[90vh] from-amber-50 via-amber-100 to-amber-50 bg-cover bg-center py-6 px-4 sm:px-8">
      {/* Client shell handles navigation + interactivity */}
      <div className="max-w-4xl mx-auto">
        <RecipeClient recipe={serializedRecipe} />
      </div>

      {/* 🔥 Required for portals used by Edit/Delete modals */}
      <div id="modal-root" />
    </div>
  );
}
