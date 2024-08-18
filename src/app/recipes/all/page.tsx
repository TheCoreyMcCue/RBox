"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import { Recipe } from "@/app/utils/types";
import { getAllRecipes } from "@/lib/actions/recipe.action";
import { fetchUserByClerkId } from "@/lib/actions/user.action";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

import Placeholder from "../../../../public/placeholder.png";
import LoadingScreen from "@/app/components/LoadingScreen";

const RECIPES_PER_PAGE = 4; // Set the number of recipes per page

const AllRecipes = () => {
  const { isSignedIn } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(true);
  const [creators, setCreators] = useState<{ [key: string]: string }>({});
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // State for category filtering
  const [categories, setCategories] = useState<string[]>([]); // State for available categories

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Function to standardize the category string (capitalize the first letter and lowercase the rest)
  const formatCategory = (category: string) =>
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const fetchedRecipes = await getAllRecipes();

        const creatorPromises = fetchedRecipes.map(async (recipe: Recipe) => {
          try {
            const creator = await fetchUserByClerkId(recipe.creator);
            return {
              recipeId: recipe._id,
              creatorName: creator
                ? `${creator.firstName} ${creator.lastName}`
                : "Unknown",
            };
          } catch (error) {
            console.error(
              `Error fetching creator for recipe ${recipe._id}:`,
              error
            );
            return {
              recipeId: recipe._id,
              creatorName: "Unknown",
            };
          }
        });

        const creatorsArray = await Promise.all(creatorPromises);

        const creatorsMap: { [key: string]: string } = {};
        creatorsArray.forEach(({ recipeId, creatorName }) => {
          creatorsMap[recipeId] = creatorName;
        });

        setCreators(creatorsMap);
        setRecipes(fetchedRecipes);

        // Extract unique categories from the fetched recipes, standardizing the format
        const allCategories: string[] = fetchedRecipes.flatMap(
          (recipe: Recipe) =>
            recipe.category.map((category) => formatCategory(category))
        );
        const uniqueCategories = Array.from(new Set(allCategories));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

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

  const handleRandomRecipe = () => {
    if (recipes.length > 0) {
      const randomIndex = Math.floor(Math.random() * recipes.length);
      const randomRecipe = recipes[randomIndex];
      window.location.href = `/recipes/${randomRecipe._id}`;
    }
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1); // Reset to the first page when the category changes
  };

  // Filter recipes based on the selected category
  const filteredRecipes = selectedCategory
    ? recipes.filter(
        (recipe) =>
          Array.isArray(recipe.category) &&
          recipe.category.some(
            (cat) => formatCategory(cat) === selectedCategory
          )
      )
    : recipes;

  // Pagination logic
  const indexOfLastRecipe = currentPage * RECIPES_PER_PAGE;
  const indexOfFirstRecipe = indexOfLastRecipe - RECIPES_PER_PAGE;
  const currentRecipes = filteredRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe
  );

  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);

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
          All Recipes
        </h1>
        <div className="flex flex-col items-center">
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
          {/* Category Filter Dropdown */}
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="border border-gray-300 rounded-md mt-6 py-2 px-4 mr-4"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentRecipes.map((recipe) => (
          <div key={recipe._id} className="flex flex-col justify-between">
            <Link href={`/recipes/${recipe._id}`}>
              <div className="block bg-white shadow-lg rounded-2xl overflow-hidden transform transition-transform hover:scale-105 cursor-pointer">
                <Image
                  src={recipe.image || Placeholder}
                  alt={recipe.title}
                  height={400}
                  width={400}
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
                  <p className="text-gray-500 mt-2">
                    Added by: {creators[recipe._id] || "Unknown"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {currentRecipes.length < 1 && (
        <p className="text-center text-gray-700">No recipes found.</p>
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

      {showButton && filteredRecipes.length > 0 && (
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

export default AllRecipes;
