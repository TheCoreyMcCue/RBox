// app/saved/page.tsx
import Image from "next/image";
import Link from "next/link";

import bg_saved from "../../../public/recipecards.png";
import Placeholder from "../../../public/placeholder.png";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSavedRecipes } from "@/lib/actions/user.action";
import { getRecipeById } from "@/lib/actions/recipe.action";

// Server Component
export default async function SavedRecipesPage() {
  // 1) AUTH CHECK (SSR)
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?._id || (session?.user as any)?.clerkId;

  if (!session || !userId) {
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

  // 2) LOAD SAVED IDS (SSR)
  const savedIds = await getSavedRecipes(userId);

  if (!savedIds || savedIds.length === 0) {
    return (
      <div
        className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg_saved.src})` }}
      >
        <h1 className="text-5xl font-[Homemade Apple] text-amber-800 drop-shadow mb-4">
          Saved Recipes ⭐
        </h1>

        <p className="font-serif text-amber-700">
          You have no saved recipes yet.
        </p>

        <Link
          href="/discover"
          className="mt-4 underline text-amber-800 text-lg font-serif"
        >
          Discover new recipes
        </Link>
      </div>
    );
  }

  // 3) LOAD ALL RECIPE OBJECTS IN PARALLEL (SSR)
  const recipePromises: Promise<any>[] = savedIds.map((id: string) =>
    getRecipeById(id)
  );
  const resolvedRecipes = await Promise.all(recipePromises);

  // Filter deleted or missing recipes
  const recipes = resolvedRecipes.filter(Boolean);

  // 4) RENDER PAGE
  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div
          className="w-full h-full bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bg_saved.src})`,
            backgroundSize: "cover",
            opacity: 0.22,
          }}
        />
      </div>
      <div className="relative z-10 min-h-[90vh] px-6 py-12 w-full">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-[Homemade Apple] text-amber-800 drop-shadow">
            Saved Recipes ⭐
          </h1>
          <p className="font-serif text-amber-700 mt-2">
            All your bookmarked favorites in one place
          </p>
        </div>

        {/* EMPTY STATE AFTER FILTERING */}
        {recipes.length === 0 ? (
          <div className="text-center text-amber-700 font-serif mt-16">
            <p className="text-xl">All saved recipes were deleted or hidden.</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {recipes.map((recipe: any) => (
              <Link key={recipe._id} href={`/recipes/${recipe._id}`}>
                <div className="bg-white/90 border border-amber-200 rounded-3xl overflow-hidden shadow hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer backdrop-blur-sm">
                  <Image
                    src={recipe.image ? recipe.image : Placeholder}
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
                    <p className="text-sm text-amber-600 mt-1">
                      ⭐ {recipe.saveCount ?? 0} saves
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
