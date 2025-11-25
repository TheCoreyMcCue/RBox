// app/my-cookbook/MyCookbookClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Placeholder from "../../../public/placeholder.png";
import bg_myCookbook from "../../../public/recipecards.png";
import { Recipe } from "../utils/types";

// Same quick category chips as before
const QUICK_CATEGORY_FILTERS = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "dessert",
  "italian",
  "mexican",
  "asian",
  "vegan",
  "vegetarian",
];

const RECIPES_PER_PAGE = 6;

interface MyCookbookClientProps {
  recipes: Recipe[];
  allRecipeIds: string[];
  currentPage: number;
  totalPages: number;
  search: string;
  activeCategory: string | null;
}

export default function MyCookbookClient({
  recipes,
  allRecipeIds,
  currentPage,
  totalPages,
  search,
  activeCategory,
}: MyCookbookClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showButton, setShowButton] = useState(true);
  const [scrollTimeoutId, setScrollTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState(search);
  const [activeCat, setActiveCat] = useState<string | null>(
    activeCategory || null
  );

  // Keep local state in sync if URL changes
  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  useEffect(() => {
    setActiveCat(activeCategory || null);
  }, [activeCategory]);

  // --------------- URL HELPERS ---------------
  const updateURL = useCallback(
    (page: number, searchValue: string, categoryValue: string | null) => {
      const params = new URLSearchParams(searchParams?.toString() || "");

      params.set("page", String(page));
      if (searchValue) params.set("search", searchValue);
      else params.delete("search");

      if (categoryValue) params.set("category", categoryValue);
      else params.delete("category");

      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    },
    [pathname, router, searchParams]
  );

  // --------------- SCROLL HANDLER (random button visibility) ---------------
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(false);
      if (scrollTimeoutId) clearTimeout(scrollTimeoutId);
      const id = setTimeout(() => setShowButton(true), 250);
      setScrollTimeoutId(id);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollTimeoutId]);

  // --------------- RANDOM RECIPE ---------------
  const handleRandomRecipe = () => {
    if (!allRecipeIds || allRecipeIds.length === 0) return;
    const randomId =
      allRecipeIds[Math.floor(Math.random() * allRecipeIds.length)];
    // store lastVisitedPath before navigating
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "lastVisitedPath",
        window.location.pathname + window.location.search
      );
    }
    router.push(`/recipes/${randomId}`);
  };

  // --------------- SEARCH CHANGE ---------------
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setActiveCat(null);
    updateURL(1, value, null);
  };

  // --------------- CATEGORY CLICK ---------------
  const handleCategoryClick = (cat: string) => {
    const next = activeCat === cat ? null : cat;
    setActiveCat(next);
    setSearchTerm("");
    updateURL(1, "", next);
  };

  // --------------- PAGINATION ---------------
  const nextPage = () => {
    if (currentPage < totalPages) {
      updateURL(currentPage + 1, searchTerm, activeCat);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      updateURL(currentPage - 1, searchTerm, activeCat);
    }
  };

  // --------------- RENDER ---------------
  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div
          className="w-full h-full bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bg_myCookbook.src})`,
            backgroundSize: "cover",
            opacity: 0.22,
          }}
        />
      </div>
      <div className="relative z-10 min-h-[90vh] container mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-14">
          <div>
            <h1 className="text-5xl font-[Homemade Apple] text-amber-800 drop-shadow-sm">
              Your Cookbook
            </h1>
            <p className="text-amber-700 font-serif mt-2">
              A cozy collection of your favorite creations 🍲
            </p>
          </div>

          <Link href="/recipes/create">
            <button className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2.5 rounded-full shadow-md text-base flex items-center gap-2 transition">
              <span>➕</span> Add Recipe
            </button>
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full max-w-lg mx-auto mb-8">
          <input
            type="text"
            placeholder="Search your cookbook..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-amber-300 rounded-full shadow-sm text-amber-800 placeholder:text-amber-400 focus:ring-2 focus:ring-amber-400"
          />
          <svg
            className="absolute left-4 top-3.5 w-5 h-5 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>

        {/* QUICK CATEGORY FILTERS */}
        <div className="max-w-3xl mx-auto mb-12 flex flex-wrap gap-3 justify-center">
          {QUICK_CATEGORY_FILTERS.map((cat) => {
            const active = activeCat === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 rounded-full text-sm font-serif border shadow-sm transition ${
                  active
                    ? "bg-amber-700 text-white border-amber-800"
                    : "bg-amber-100/80 text-amber-800 border-amber-300 hover:bg-amber-200"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            );
          })}
        </div>

        {/* RECIPE GRID */}
        {recipes.length === 0 ? (
          <div className="text-center text-amber-700 font-serif mt-16">
            <p className="text-xl">No recipes match your filters yet.</p>
            <p className="mt-2">Try adjusting your search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {recipes.map((recipe) => {
              const saveCount = (recipe as any).saveCount as number | undefined;

              return (
                <Link
                  key={recipe._id}
                  href={`/recipes/${recipe._id}`}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      sessionStorage.setItem(
                        "lastVisitedPath",
                        window.location.pathname + window.location.search
                      );
                    }
                  }}
                  className="group"
                >
                  <div className="flex flex-col h-full bg-white/90 border border-amber-200 rounded-3xl shadow-md overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                    <div className="relative">
                      <Image
                        src={recipe.image || Placeholder}
                        alt={recipe.title}
                        width={600}
                        height={400}
                        className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/25 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h2 className="text-2xl font-semibold text-amber-800 group-hover:text-amber-700 transition line-clamp-1">
                          {recipe.title}
                        </h2>
                        <p className="text-amber-700/80 mt-2 font-serif line-clamp-2">
                          {recipe.description}
                        </p>
                      </div>

                      <div className="mt-6 flex justify-between items-center text-sm text-amber-700 border-t border-amber-100 pt-4">
                        <span>
                          ⏱ {recipe.cookTime} min
                          {typeof saveCount === "number" && saveCount > 0 && (
                            <>
                              {" • "}⭐ {saveCount ?? 0} saves
                            </>
                          )}
                        </span>
                        <span className="text-amber-700 font-medium group-hover:underline">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {recipes.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center mt-16 space-x-3">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="px-5 py-2.5 rounded-full bg-amber-600 text-white disabled:opacity-40 shadow-md hover:scale-105 transition"
            >
              ← Prev
            </button>
            <span className="font-medium text-amber-700 font-serif">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="px-5 py-2.5 rounded-full bg-amber-600 text-white disabled:opacity-40 shadow-md hover:scale-105 transition"
            >
              Next →
            </button>
          </div>
        )}

        {/* RANDOM RECIPE BUTTON */}
        {showButton && allRecipeIds.length > 0 && (
          <div className="fixed left-0 right-0 flex justify-center pointer-events-none bottom-16 sm:bottom-24 md:bottom-28 lg:bottom-32 z-[1000]">
            <button
              onClick={handleRandomRecipe}
              className="pointer-events-auto bg-amber-700 hover:bg-amber-800 text-white py-3 px-10 rounded-full text-lg font-semibold shadow-lg transform hover:scale-105 transition"
            >
              🎲 Choose a Random Recipe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
