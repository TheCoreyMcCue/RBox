"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { getRecipesByUser } from "@/lib/actions/recipe.action";
import Link from "next/link";
import Image from "next/image";

import { Recipe } from "../utils/types";

import Placeholder from "../../../public/placeholder.png";

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(true); // State to manage button visibility
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    const fetchRecipes = async () => {
      if (user) {
        try {
          const fetchedRecipes = await getRecipesByUser(user.id);
          setRecipes(fetchedRecipes);
        } catch (error) {
          console.error("Error fetching recipes:", error);
        } finally {
        }
      } else {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [user]);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      // Hide button when scrolling
      setShowButton(false);

      // Clear the previous timeout if there is one
      if (scrollTimeout) clearTimeout(scrollTimeout);

      // Set a timeout to show the button after 250ms of no scrolling
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
  }, [scrollTimeout]); // Dependency on scrollTimeout

  // Random Recipe Navigation
  const handleRandomRecipe = () => {
    if (recipes.length > 0) {
      const randomIndex = Math.floor(Math.random() * recipes.length);
      const randomRecipe = recipes[randomIndex];
      window.location.href = `/recipes/${randomRecipe._id}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce"></div>
          <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce delay-150"></div>
          <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce delay-300"></div>
        </div>
        <span className="mt-4 text-gray-600 text-lg">Loading Recipes...</span>
      </div>
    );
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
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <div key={recipe._id} className="flex flex-col justify-between">
              <Link href={`/recipes/${recipe._id}`}>
                <div className="block bg-white shadow-lg rounded-2xl overflow-hidden transform transition-transform hover:scale-105 cursor-pointer">
                  <Image
                    src={recipe.image || Placeholder}
                    alt={recipe.title}
                    height={700}
                    width={700}
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
      ) : (
        <p className="text-center text-gray-700">No recipes found.</p>
      )}

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
