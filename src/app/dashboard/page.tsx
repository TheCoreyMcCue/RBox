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
  const isSignedIn = status === "authenticated";
  const clerkId: string | undefined = (session?.user as any)?.clerkId;

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

  if (loading || status === "loading") return <LoadingScreen />;
  if (!isSignedIn) return <NotSigned />;

  return (
    <div className="min-h-[90vh] bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 bg-cover bg-center container mx-auto px-4 py-12 relative">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-10">
        <h1 className="text-4xl font-[Homemade Apple] text-amber-800 mb-4 sm:mb-0 text-center sm:text-left drop-shadow-sm">
          Your Recipes
        </h1>
        <Link href="/recipes/create">
          <button
            type="button"
            className="flex items-center bg-amber-700 text-white py-2 px-5 rounded-full text-base font-semibold hover:bg-amber-800 transition duration-300 shadow-sm hover:shadow-md"
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

      <div className="relative w-full max-w-md mx-auto mb-10">
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
          className="w-full pl-10 pr-4 py-3 rounded-full border border-amber-300 shadow-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all bg-white/80 backdrop-blur-sm text-amber-800 placeholder:text-amber-400"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 absolute left-3 top-3.5 text-amber-400"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <div className="h-full bg-amber-50/80 backdrop-blur-md rounded-2xl shadow-md overflow-hidden border border-amber-200 transition-transform transform hover:-translate-y-1 hover:shadow-xl duration-300">
              <Image
                src={recipe.image || Placeholder}
                alt={recipe.title}
                height={400}
                width={600}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-5 flex flex-col">
                <h2 className="text-xl font-semibold text-amber-800 group-hover:text-amber-700 transition">
                  {recipe.title}
                </h2>
                <p className="text-amber-700/80 line-clamp-2 mt-2 font-serif">
                  {recipe.description}
                </p>
                <div className="flex justify-between items-center mt-4 text-sm text-amber-600">
                  <span>Cook Time: {recipe.cookTime}m</span>
                  <span className="text-amber-700 font-medium group-hover:underline">
                    View →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredRecipes.length < 1 && (
        <p className="text-center text-amber-700 mt-8 font-serif">
          No recipes found.
        </p>
      )}

      {filteredRecipes.length > 0 && (
        <div className="flex justify-center items-center mt-12 space-x-3">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-5 py-2 rounded-full bg-amber-600 text-white disabled:opacity-40 transition hover:scale-105 shadow-sm hover:shadow-md"
          >
            ← Prev
          </button>
          <span className="font-medium text-amber-700 font-serif">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-5 py-2 rounded-full bg-amber-600 text-white disabled:opacity-40 transition hover:scale-105 shadow-sm hover:shadow-md"
          >
            Next →
          </button>
        </div>
      )}

      {showButton && recipes.length > 0 && (
        <div
          className="fixed left-0 right-0 flex justify-center items-center pointer-events-none bottom-16 sm:bottom-24 md:bottom-28 lg:bottom-32"
          style={{ zIndex: 1000 }}
        >
          <button
            onClick={handleRandomRecipe}
            className="pointer-events-auto bg-gradient-to-r from-amber-700 to-amber-600 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-lg hover:from-amber-800 hover:to-amber-700 transition-transform duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            Choose a Random Recipe
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
