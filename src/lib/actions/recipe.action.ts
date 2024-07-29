"use server";

import Recipe from "@/lib/models/recipe.model";
import { connect } from "@/lib/db";

type GetRecipesByUserParams = {
  userId: string;
};

const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};

export async function createRecipe(recipe: any) {
  try {
    await connect();
    const newRecipe = await Recipe.create(recipe);
    return JSON.parse(JSON.stringify(newRecipe));
  } catch (error) {
    console.log(error);
  }
}

export const getAllRecipes = async () => {
  try {
    await connect(); // Ensure database connection
    const allRecipes = await Recipe.find().lean().exec(); // Fetch all recipes as plain objects
    return JSON.parse(JSON.stringify(allRecipes)); // Return recipes in JSON format
  } catch (error) {
    console.error("Error fetching all recipes:", error);
    throw error;
  }
};

export const getRecipesByUser = async (userId: string) => {
  try {
    await connect();
    const recipes = await Recipe.find({ creator: userId }).lean().exec(); // Use lean() to get plain objects
    return JSON.parse(JSON.stringify(recipes)); // Convert to plain JSON objects
  } catch (error) {
    console.error("Error fetching recipes by user:", error);
    throw error;
  }
};
export const getRecipeById = async (id: string) => {
  try {
    await connect();
    const updatedRecipe = await Recipe.findById(id).exec();
    return updatedRecipe ? JSON.parse(JSON.stringify(updatedRecipe)) : null;
  } catch (error) {
    console.error("Error fetching recipe by ID:", error);
    throw error;
  }
};

export const deleteRecipe = async (recipeId: string, userId: string) => {
  try {
    await connect();
    await Recipe.deleteOne({ _id: recipeId, creator: userId }).exec();
  } catch (error) {
    console.error("Error deleting recipe:", error);
    throw error;
  }
};

export const updateRecipe = async (id: string, updatedRecipe: any) => {
  try {
    await connect();
    const recipe = await Recipe.findByIdAndUpdate(id, updatedRecipe, {
      new: true, // Return the updated document
    }).exec();
    return recipe ? JSON.parse(JSON.stringify(recipe)) : null;
  } catch (error) {
    console.error("Error updating recipe:", error);
    throw error;
  }
};
