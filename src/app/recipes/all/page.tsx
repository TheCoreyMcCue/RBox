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

const RECIPES_PER_PAGE = 6;

const AllRecipes = () => {
  const { isSignedIn } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(true);
  const [creators, setCreators] = useState<{ [key: string]: string }>({});
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const formatCategory = (category: string) =>
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await getAllRecipes(currentPage, RECIPES_PER_PAGE);
        const fetchedRecipes = response.recipes;
        const totalRecipes = response.totalRecipes;

        const creatorPromises = fetchedRecipes.map(async (recipe: any) => {
          try {
            const creator = await fetchUserByClerkId(recipe.creator);
            return {
              recipeId: recipe._id,
              creatorName: creator
                ? `${creator.firstName} ${creator.lastName}`
                : "Unknown",
            };
          } catch {
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
        setTotalPages(Math.ceil(totalRecipes / RECIPES_PER_PAGE));

        // ✅ FIX: Safely map categories
        const allCategories = fetchedRecipes.flatMap((r: any) =>
          Array.isArray(r.category)
            ? r.category.map((c: any) => formatCategory(c))
            : []
        );
        setCategories(Array.from(new Set(allCategories)));
      } catch (err) {
        console.error("Error fetching recipes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [currentPage]);

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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  // ✅ FIX: Safely check for array before filtering
  const filteredRecipes = selectedCategory
    ? recipes.filter(
        (recipe) =>
          Array.isArray(recipe.category) &&
          recipe.category.some(
            (cat) => formatCategory(cat) === selectedCategory
          )
      )
    : recipes;

  const nextPage = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const jumpToPage = (page: number) => setCurrentPage(page);

  const generatePageNumbers = () => {
    const pages = [];

    if (currentPage !== 1) {
      pages.push(
        <button
          key={1}
          onClick={() => jumpToPage(1)}
          className="px-4 py-2 rounded-full bg-gray-300"
        >
          1
        </button>
      );
    }

    pages.push(
      <button
        key={currentPage}
        className="px-4 py-2 rounded-full bg-blue-500 text-white"
      >
        {currentPage}
      </button>
    );

    if (currentPage < totalPages - 1) {
      pages.push(
        <span key="ellipsis" className="px-3 py-2">
          ...
        </span>
      );
    }

    if (currentPage !== totalPages) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => jumpToPage(totalPages)}
          className="px-4 py-2 rounded-full bg-gray-300"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (loading) return <LoadingScreen />;

  if (!isSignedIn) {
    return (
      <div className="bg-gradient-to-br from-red-500 via-white-500 to-blue-600 min-h-[90vh] text-white flex flex-col items-center justify-center">
        <div className="text-center max-w-xl p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-2xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-orange-500">
            Welcome to Recipe Nest!
          </h1>
          <p className="text-lg md:text-xl mb-6 font-light">
            Sign in to discover and manage your favorite recipes effortlessly.
          </p>
          <div className="inline-block">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-10 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg cursor-pointer">
              <SignInButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">All Recipes</h1>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="px-4 py-2 border rounded-full"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRecipes.map((recipe) => (
          <div key={recipe._id} className="h-full">
            <Link href={`/recipes/${recipe._id}`}>
              <div className="h-full flex flex-col rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer bg-white">
                <Image
                  src={recipe.image || Placeholder}
                  alt={recipe.title}
                  height={400}
                  width={400}
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
                  <p className="text-gray-500 mt-1">
                    Added by: {creators[recipe._id] || "Unknown"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {filteredRecipes.length < 1 && (
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
        <div className="flex space-x-2">{generatePageNumbers()}</div>
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
