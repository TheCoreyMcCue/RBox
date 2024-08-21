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

const RECIPES_PER_PAGE = 4; // Number of recipes per page

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(true); // State to manage button visibility
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (user) {
        try {
          const fetchedRecipes = await getRecipesByUser(user.id);
          setRecipes(fetchedRecipes);
        } catch (error) {
          console.error("Error fetching recipes:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRecipes();
  }, [user]);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(false);

      if (scrollTimeout) clearTimeout(scrollTimeout);

      setScrollTimeout(
        setTimeout(() => {
          setShowButton(true);
        }, 250)
      );
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollTimeout]);

  // Random Recipe Navigation
  const handleRandomRecipe = () => {
    if (recipes.length > 0) {
      const randomIndex = Math.floor(Math.random() * recipes.length);
      const randomRecipe = recipes[randomIndex];
      window.location.href = `/recipes/${randomRecipe._id}`;
    }
  };

  // Pagination logic
  const indexOfLastRecipe = currentPage * RECIPES_PER_PAGE;
  const indexOfFirstRecipe = indexOfLastRecipe - RECIPES_PER_PAGE;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isSignedIn) {
    return (
      <div className="bg-gradient-to-br from-red-500 via-white-500 to-blue-600 min-h-[90vh] text-white flex flex-col items-center justify-center">
        <div className="text-center max-w-xl p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-2xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-orange-500">
            Welcome to Our Box!
          </h1>
          <p className="text-lg md:text-xl mb-6 font-light">
            Sign in to discover and manage your favorite recipes effortlessly.
          </p>
          <div className="inline-block">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-10 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg cursor-pointer">
              <SignInButton>Sign Up Now</SignInButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <div key={recipe._id} className="flex flex-col justify-between">
            <Link href={`/recipes/${recipe._id}`}>
              <div className="block bg-white shadow-lg rounded-2xl overflow-hidden transform transition-transform hover:scale-105 cursor-pointer">
                <Image
                  src={recipe.image || Placeholder}
                  alt={recipe.title}
                  height={500}
                  width={500}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-2xl font-semibold mb-2">
                    {recipe.title}
                  </h2>
                  <p className="text-gray-700">{recipe.description}</p>
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
        <p className="text-center text-gray-700">No recipes found.</p>
      )}

      {/* Pagination Controls */}
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

      {/* Overlay Button */}
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
