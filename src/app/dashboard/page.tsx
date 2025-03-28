"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { getRecipesByUser } from "@/lib/actions/recipe.action";
import Link from "next/link";
import Image from "next/image";

import { Recipe } from "../utils/types";
import Placeholder from "../../../public/placeholder.png";
import LoadingScreen from "../components/LoadingScreen";
import NotSigned from "../components/NotSigned";

import { lasagnaRecipe } from "./exampleRecipe";

const RECIPES_PER_PAGE = 6;

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(true);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchRecipesAndTestParse = async () => {
      if (user) {
        try {
          const fetchedRecipes = await getRecipesByUser(user.id);
          setRecipes(fetchedRecipes);

          // Optional test parse
          const res = await fetch("/api/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipeText: lasagnaRecipe,
            }),
          });

          if (res.ok) {
            const parsed = await res.json();
            console.log("Parsed recipe via API:", parsed);
          } else {
            const err = await res.json();
            console.error("Error parsing recipe:", err);
          }
        } catch (error) {
          console.error("Error loading dashboard:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRecipesAndTestParse();
  }, [user]);

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

  const indexOfLastRecipe = currentPage * RECIPES_PER_PAGE;
  const indexOfFirstRecipe = indexOfLastRecipe - RECIPES_PER_PAGE;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);

  const nextPage = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  if (loading) return <LoadingScreen />;

  if (!isSignedIn) return <NotSigned />;

  return (
    <div className="min-h-[90vh] container mx-auto px-4 py-8 relative">
      <div className="flex flex-col items-center justify-between mb-8 sm:flex-row">
        <h1 className="text-4xl font-bold mb-4 sm:mb-0 text-center">
          Your Recipes
        </h1>
        <Link href="/recipes/create">
          <button
            type="button"
            className="flex items-center mt-2 text-blue-500 hover:text-blue-700 transition duration-200 focus:outline-none"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentRecipes.map((recipe) => (
          <div key={recipe._id} className="h-full">
            <Link href={`/recipes/${recipe._id}`}>
              <div className="h-full flex flex-col bg-white shadow-lg rounded-2xl overflow-hidden transform transition-transform hover:scale-105 cursor-pointer">
                <Image
                  src={recipe.image || Placeholder}
                  alt={recipe.title}
                  height={500}
                  width={500}
                  className="w-full h-48 object-cover"
                />
                <div className="flex-1 p-4 flex flex-col">
                  <h2 className="text-2xl font-semibold mb-2">
                    {recipe.title}
                  </h2>
                  <p className="text-gray-700 flex-grow">
                    {recipe.description}
                  </p>
                  <p className="text-gray-500 mt-2">
                    Cook Time: {recipe.cookTime} minutes
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {recipes.length < 1 && (
        <p className="text-center text-gray-700 mt-8">No recipes found.</p>
      )}

      <div className="flex justify-center items-center mt-8 space-x-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:bg-gray-400"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:bg-gray-400"
        >
          Next
        </button>
      </div>

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
