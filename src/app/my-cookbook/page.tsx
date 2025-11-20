"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import { getRecipesByUser } from "@/lib/actions/recipe.action";
import Link from "next/link";
import Image from "next/image";
import { Recipe } from "../utils/types";
import Placeholder from "../../../public/placeholder.png";
import LoadingScreen from "../components/LoadingScreen";

const RECIPES_PER_PAGE = 6;

// 🌟 Quick categories displayed as chips
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

const Dashboard = () => {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const userId: string | undefined =
    (session?.user as any)?._id || (session?.user as any)?.clerkId;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const [showButton, setShowButton] = useState(true);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  // --- Read URL for pagination & search ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setCurrentPage(parseInt(params.get("page") || "1", 10));
      setSearchTerm(params.get("search") || "");
    }
  }, []);

  // --- Load recipes ---
  useEffect(() => {
    const load = async () => {
      if (!userId) return setLoading(false);

      try {
        const data = await getRecipesByUser(userId);
        setRecipes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  // --- Scroll hide/show random button ---
  useEffect(() => {
    const onScroll = () => {
      setShowButton(false);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      setScrollTimeout(setTimeout(() => setShowButton(true), 250));
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollTimeout]);

  // --- Open a random recipe ---
  const handleRandomRecipe = () => {
    if (recipes.length === 0) return;
    const r = recipes[Math.floor(Math.random() * recipes.length)];
    window.location.href = `/recipes/${r._id}`;
  };

  // --- Combined filtering logic ---
  const filteredRecipes = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    return recipes.filter((r) => {
      const matchText =
        r.title.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower) ||
        r.categories?.some((c) => c.toLowerCase().includes(lower));

      const matchCategory =
        !activeCategory || r.categories?.includes(activeCategory.toLowerCase());

      return matchText && matchCategory;
    });
  }, [recipes, searchTerm, activeCategory]);

  // --- Pagination ---
  const indexOfLast = currentPage * RECIPES_PER_PAGE;
  const indexOfFirst = indexOfLast - RECIPES_PER_PAGE;
  const currentRecipes = filteredRecipes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);

  const updateURL = (page: number, search: string) => {
    window.history.replaceState(null, "", `?page=${page}&search=${search}`);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      const p = currentPage + 1;
      setCurrentPage(p);
      updateURL(p, searchTerm);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const p = currentPage - 1;
      setCurrentPage(p);
      updateURL(p, searchTerm);
    }
  };

  // --- Loading screen ---
  if (loading || status === "loading")
    return <LoadingScreen message="loading your recipes" />;

  // --- SIGN IN GATE ---
  if (!isSignedIn)
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl font-[Homemade Apple] text-amber-800">
          Welcome to Your Cookbook
        </h1>
        <p className="text-amber-700 font-serif my-6">
          Sign in to start saving your family favorites 🍲
        </p>
        <button
          onClick={() => signIn("google")}
          className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-full shadow-md text-lg transition"
        >
          Sign in with Google
        </button>
      </div>
    );

  // --- EMPTY STATE ---
  if (recipes.length === 0)
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl font-[Homemade Apple] text-amber-800">
          Your Cookbook is Empty
        </h1>
        <p className="text-amber-700 font-serif my-6">
          Start by adding your first recipe! 🍳
        </p>
        <Link href="/recipes/create">
          <button className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-full shadow-md text-lg transition">
            ➕ Add a Recipe
          </button>
        </Link>
      </div>
    );

  // ------------------------------
  // MAIN DASHBOARD RETURN
  // ------------------------------
  return (
    <div className="min-h-[90vh] container mx-auto px-4 py-12 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center">
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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setActiveCategory(null); // clears chip when typing
            setCurrentPage(1);
            updateURL(1, e.target.value);
          }}
          className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-amber-300 rounded-full shadow-sm text-amber-800 placeholder:text-amber-400 focus:ring-2 focus:ring-amber-400"
        />
        <svg
          className="absolute left-4 top-3.5 w-5 h-5 text-amber-400"
          fill="none"
          stroke="currentColor"
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
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                const next = active ? null : cat;
                setActiveCategory(next);
                setSearchTerm("");
                updateURL(1, "");
                setCurrentPage(1);
              }}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {currentRecipes.map((recipe) => (
          <Link
            key={recipe._id}
            href={`/recipes/${recipe._id}`}
            onClick={() =>
              sessionStorage.setItem(
                "lastVisitedPath",
                window.location.pathname + window.location.search
              )
            }
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
                  <span>⏱ {recipe.cookTime} minutes</span>
                  <span className="text-amber-700 font-medium group-hover:underline">
                    View →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* PAGINATION */}
      {filteredRecipes.length > 0 && (
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
      {showButton && recipes.length > 0 && (
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
  );
};

export default Dashboard;
