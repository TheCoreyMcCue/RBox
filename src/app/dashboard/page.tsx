"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getRecipesByUser } from "@/lib/actions/recipe.action";
import Link from "next/link";
import Image from "next/image";
import { Recipe } from "../utils/types";
import Placeholder from "../../../public/placeholder.png";
import LoadingScreen from "../components/LoadingScreen";
import NotSigned from "../components/NotSigned";

const RECIPES_PER_PAGE = 6;

const Dashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const clerkId = session?.user?.clerkId;
  const loadingSession = status === "loading";
  const isSignedIn = status === "authenticated";

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(true);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Read query params manually once client-side
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
      if (!clerkId) return;
      try {
        const fetchedRecipes = await getRecipesByUser(clerkId);
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [clerkId]);

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
    return recipes.filter((recipe) =>
      `${recipe.title} ${recipe.description}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
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

  if (loading || loadingSession) return <LoadingScreen />;
  if (!isSignedIn) return <NotSigned />;

  return (
    <div className="min-h-[90vh] container mx-auto px-4 py-8 relative">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
        <h1 className="text-4xl font-bold mb-4 sm:mb-0 text-center sm:text-left">
          Your Recipes
        </h1>
        <Link href="/recipes/create">
          <button
            type="button"
            className="flex items-center text-blue-500 hover:text-blue-700 transition duration-200 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5 mr-1"
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

      <div className="relative w-full max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Search your recipes..."
          value={searchTerm}
          onChange={(e) => {
            const val = e.target.value;
            setSearchTerm(val);
            setCurrentPage(1);
            updateURL(1, val);
          }}
          className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 absolute left-3 top-3.5 text-gray-500"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentRecipes.map((recipe) => (
          <Link
            key={recipe._id}
            href={`/recipes/${recipe._id}`}
            onClick={() =>
              sessionStorage.setItem(
                "lastVisitedPath",
                `/dashboard?page=${currentPage}&search=${encodeURIComponent(
                  searchTerm
                )}`
              )
            }
            className="group"
          >
            <div className="h-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-2xl duration-300">
              <Image
                src={recipe.image || Placeholder}
                alt={recipe.title}
                height={400}
                width={600}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4 flex flex-col">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white group-hover:text-blue-500 transition">
                  {recipe.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mt-2">
                  {recipe.description}
                </p>
                <div className="flex justify-between items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>Cook Time: {recipe.cookTime}m</span>
                  <span className="text-blue-500 font-medium">View →</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredRecipes.length < 1 && (
        <p className="text-center text-gray-700 mt-8">No recipes found.</p>
      )}

      {filteredRecipes.length > 0 && (
        <div className="flex justify-center items-center mt-10 space-x-3">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white disabled:opacity-40 transition hover:scale-105"
          >
            ← Prev
          </button>
          <span className="font-medium text-gray-700">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white disabled:opacity-40 transition hover:scale-105"
          >
            Next →
          </button>
        </div>
      )}

      {showButton && recipes.length > 0 && (
        <div
          className="fixed bottom-4 left-0 right-0 flex justify-center items-center pointer-events-none"
          style={{ zIndex: 1000 }}
        >
          <button
            onClick={handleRandomRecipe}
            className="pointer-events-auto bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-lg hover:from-orange-500 hover:to-pink-500 transition-transform duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            Choose a Random Recipe
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
