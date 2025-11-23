// app/my-cookbook/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // ⬅ your existing NextAuth configimport { redirect } from "next/navigation";
import { getRecipesByUser } from "@/lib/actions/recipe.action";
import MyCookbookClient from "../components/MyCookbookClient";
import { Recipe } from "../utils/types";
import { redirect } from "next/navigation";

const RECIPES_PER_PAGE = 6;

interface MyCookbookPageProps {
  searchParams?: {
    page?: string;
    search?: string;
    category?: string;
  };
}

export default async function MyCookbookPage({
  searchParams,
}: MyCookbookPageProps) {
  const session = await getServerSession(authOptions);

  // If not signed in, show a gentle gate
  if (!session?.user) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 bg-cover bg-center">
        <h1 className="text-5xl font-[Homemade Apple] text-amber-800 mb-4">
          Welcome to Your Cookbook
        </h1>
        <p className="text-amber-700 font-serif mb-8">
          Sign in to start saving your family favorites 🍲
        </p>
        <a
          href="/api/auth/signin"
          className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
        >
          Sign In
        </a>
      </div>
    );
  }

  const userId =
    (session.user as any)?._id || (session.user as any)?.clerkId || "";

  if (!userId) {
    // If somehow we have a session but no ID, just redirect home
    redirect("/");
  }

  const page = Number(searchParams?.page ?? "1") || 1;
  const search = (searchParams?.search ?? "").toLowerCase();
  const category = (searchParams?.category ?? "").toLowerCase();

  // Fetch recipes for this user on the server
  const allRecipes: Recipe[] = await getRecipesByUser(userId);

  // If no recipes, show empty state (SSR)
  if (!allRecipes || allRecipes.length === 0) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 bg-cover bg-center">
        <h1 className="text-5xl font-[Homemade Apple] text-amber-800 mb-4">
          Your Cookbook is Empty
        </h1>
        <p className="text-amber-700 font-serif mb-8">
          Start by adding your first recipe and make it your own! 🍳
        </p>
        <a
          href="/recipes/create"
          className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
        >
          ➕ Add Your First Recipe
        </a>
      </div>
    );
  }

  // ----------------- SERVER-SIDE FILTERING -----------------
  const filtered: Recipe[] = allRecipes.filter((recipe) => {
    const matchesSearch =
      !search ||
      recipe.title.toLowerCase().includes(search) ||
      recipe.description.toLowerCase().includes(search) ||
      recipe.categories?.some((c) => c.toLowerCase().includes(search));

    const matchesCategory =
      !category || recipe.categories?.some((c) => c.toLowerCase() === category);

    return matchesSearch && matchesCategory;
  });

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / RECIPES_PER_PAGE));

  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * RECIPES_PER_PAGE;
  const currentRecipes = filtered.slice(
    startIndex,
    startIndex + RECIPES_PER_PAGE
  );

  const allRecipeIds = filtered.map((r) => r._id);

  return (
    <div className="min-h-[90vh] bg-cover bg-center">
      <MyCookbookClient
        recipes={currentRecipes}
        allRecipeIds={allRecipeIds}
        currentPage={safePage}
        totalPages={totalPages}
        search={searchParams?.search ?? ""}
        activeCategory={category || null}
      />
    </div>
  );
}
