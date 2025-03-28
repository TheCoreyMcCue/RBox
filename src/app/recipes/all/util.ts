import { getAllRecipes } from "@/lib/actions/recipe.action";
import { fetchUserByClerkId } from "@/lib/actions/user.action";
import { Recipe } from "@/app/utils/types";

export const fetchRecipesUtil = async (
  currentPage: number,
  recipesPerPage: number,
  formatCategory: (category: string) => string
) => {
  try {
    const response = await getAllRecipes(currentPage, recipesPerPage);
    const fetchedRecipes = response.recipes;
    const totalRecipes = response.totalRecipes;

    const creatorPromises = fetchedRecipes.map(async (recipe: Recipe) => {
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

    const allCategories = fetchedRecipes.flatMap((r: Recipe) =>
      Array.isArray(r.category) ? r.category.map((c) => formatCategory(c)) : []
    );

    return {
      fetchedRecipes,
      totalRecipes,
      creatorsMap,
      uniqueCategories: Array.from(new Set(allCategories)) as string[],
    };
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
};

export const navigateToRandomRecipe = (recipes: Recipe[]) => {
  if (recipes.length > 0) {
    const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
    window.location.href = `/recipes/${randomRecipe._id}`;
  }
};
