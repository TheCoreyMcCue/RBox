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
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pageParam = parseInt(params.get("page") || "1", 10);
      const searchParam = params.get("search") || "";
      setCurrentPage(pageParam);
      setSearchTerm(searchParam);
    }
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const fetchedRecipes = await getRecipesByUser(userId);
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [userId]);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(false);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      setScrollTimeout(setTimeout(() => setShowButton(true), 250));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollTimeout]);

  const handleRandomRecipe = () => {
    if (recipes.length > 0) {
      const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
      window.location.href = `/recipes/${randomRecipe._id}`;
    }
  };

  const filteredRecipes = useMemo(() => {
    if (!searchTerm.trim()) return recipes;

    const lowerSearch = searchTerm.toLowerCase();

    return recipes.filter((recipe) => {
      const titleMatch = recipe.title?.toLowerCase().includes(lowerSearch);
      const descMatch = recipe.description?.toLowerCase().includes(lowerSearch);

      const categoryMatch = recipe.categories?.some((cat) =>
        cat.toLowerCase().includes(lowerSearch)
      );

      return titleMatch || descMatch || categoryMatch;
    });
  }, [recipes, searchTerm]);

  const indexOfLastRecipe = currentPage * RECIPES_PER_PAGE;
  const indexOfFirstRecipe = indexOfLastRecipe - RECIPES_PER_PAGE;
  const currentRecipes = filteredRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe
  );
  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);

  const updateURL = (page: number, search: string) => {
    const newUrl = `?page=${page}&search=${encodeURIComponent(search)}`;
    window.history.replaceState(null, "", newUrl);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      updateURL(newPage, searchTerm);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      updateURL(newPage, searchTerm);
    }
  };

  if (loading || status === "loading")
    return <LoadingScreen message="loading your recipes" />;

  // ✅ Case 1: Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center text-center from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center px-4">
        <h1 className="text-5xl font-[Homemade Apple] text-amber-800 mb-4">
          Welcome to Your Cookbook
        </h1>
        <p className="text-amber-700 font-serif mb-8">
          Sign in to start saving your favorite recipes 🍲
        </p>
        <button
          onClick={() => signIn("google")}
          className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  // ✅ Case 2: Signed in but no recipes
  if (isSignedIn && recipes.length === 0) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center text-center from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center px-4">
        <h1 className="text-5xl font-[Homemade Apple] text-amber-800 mb-4">
          Your Cookbook is Empty
        </h1>
        <p className="text-amber-700 font-serif mb-8">
          Start by adding your first recipe and make it your own! 🍳
        </p>
        <Link href="/recipes/create">
          <button className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition-all duration-300">
            ➕ Add Your First Recipe
          </button>
        </Link>
      </div>
    );
  }

  // ✅ Case 3: Signed in & has recipes
  return (
    <div className="min-h-[90vh] from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center container mx-auto px-4 py-12 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-14 relative">
        <div className="text-center sm:text-left relative">
          <h1 className="text-5xl font-[Homemade Apple] text-amber-800 drop-shadow-sm relative z-10">
            Your Cookbook
          </h1>
          <p className="text-amber-700/80 font-serif mt-2">
            A cozy collection of your favorite creations 🍲
          </p>
          <div className="absolute -bottom-2 left-1/2 sm:left-0 transform -translate-x-1/2 sm:translate-x-0 w-40 h-[3px] bg-gradient-to-r from-amber-600 to-amber-400 rounded-full opacity-80"></div>
        </div>

        <Link href="/recipes/create">
          <button
            type="button"
            className="mt-6 sm:mt-0 flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white py-2.5 px-6 rounded-full text-base font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Recipe
          </button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-lg mx-auto mb-12">
        <input
          type="text"
          placeholder="Search your cookbook..."
          value={searchTerm}
          onChange={(e) => {
            const val = e.target.value;
            setSearchTerm(val);
            setCurrentPage(1);
            updateURL(1, val);
          }}
          className="w-full pl-12 pr-4 py-3 rounded-full border border-amber-300 shadow-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all bg-white/90 backdrop-blur-sm text-amber-800 placeholder:text-amber-400"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 absolute left-4 top-3.5 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
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

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {currentRecipes.map((recipe) => (
          <Link
            key={recipe._id}
            href={`/recipes/${recipe._id}`}
            onClick={() => {
              sessionStorage.setItem(
                "lastVisitedPath",
                window.location.pathname + window.location.search
              );
            }}
            className="group"
          >
            <div className="flex flex-col h-full bg-white/90 backdrop-blur-sm border border-amber-200 rounded-3xl shadow-md overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
              <div className="relative">
                <Image
                  src={recipe.image || Placeholder}
                  alt={recipe.title}
                  height={400}
                  width={600}
                  className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/25 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              <div className="flex flex-col justify-between flex-1 p-6">
                <div>
                  <h2 className="text-2xl font-semibold text-amber-800 group-hover:text-amber-700 transition line-clamp-1">
                    {recipe.title}
                  </h2>
                  <p className="text-amber-700/80 mt-2 font-serif line-clamp-2">
                    {recipe.description}
                  </p>
                </div>

                <div className="mt-6 flex justify-between items-center text-sm text-amber-700 pt-4 border-t border-amber-100">
                  <span className="flex items-center gap-1">
                    ⏱️ <span>{recipe.cookTime} minutes</span>
                  </span>
                  <span className="text-amber-700 font-medium group-hover:underline">
                    View →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {filteredRecipes.length > 0 && (
        <div className="flex justify-center items-center mt-16 space-x-3">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-5 py-2.5 rounded-full bg-amber-600 text-white disabled:opacity-40 transition hover:scale-105 shadow-md hover:shadow-lg"
          >
            ← Prev
          </button>
          <span className="font-medium text-amber-700 font-serif">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-5 py-2.5 rounded-full bg-amber-600 text-white disabled:opacity-40 transition hover:scale-105 shadow-md hover:shadow-lg"
          >
            Next →
          </button>
        </div>
      )}

      {/* Random Recipe Button */}
      {showButton && recipes.length > 0 && (
        <div
          className="fixed left-0 right-0 flex justify-center items-center pointer-events-none bottom-16 sm:bottom-24 md:bottom-28 lg:bottom-32"
          style={{ zIndex: 1000 }}
        >
          <button
            onClick={handleRandomRecipe}
            className="pointer-events-auto bg-gradient-to-r from-amber-700 to-amber-600 text-white py-3 px-10 rounded-full text-lg font-semibold shadow-lg hover:from-amber-800 hover:to-amber-700 transition-transform duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            🎲 Choose a Random Recipe
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
