"use server";

import Recipe from "@/lib/models/recipe.model";
import { connect } from "@/lib/db";
import mongoose from "mongoose";
import User from "@/lib/models/user.model";

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

    // Find the user (to include legacy clerkId if needed)
    const user = await User.findById(recipe.creator)
      .lean<{ clerkId?: string }>()
      .exec();

    const newRecipeData = {
      ...recipe,
      creator: recipe.creator, // always the Mongo _id (string)
      ...(user?.clerkId ? { creatorClerkId: user.clerkId } : {}), // optional legacy reference
    };

    const newRecipe = await Recipe.create(newRecipeData);
    return JSON.parse(JSON.stringify(newRecipe));
  } catch (error) {
    console.error("Error creating recipe:", error);
    throw error;
  }
}

export const getAllRecipes = async (page = 1, limit = 4) => {
  try {
    await connect(); // Ensure database connection

    const skip = (page - 1) * limit; // Calculate how many recipes to skip based on page and limit
    console.log(`Fetching recipes for page ${page}, skipping ${skip} recipes`); // Debugging log

    // Fetch the paginated recipes
    const allRecipes = await Recipe.find()
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    console.log(`Fetched recipes:`, allRecipes); // Debugging log

    // Fetch the total count of recipes for pagination
    const totalRecipes = await Recipe.countDocuments().exec();

    console.log(`Total recipes count: ${totalRecipes}`); // Debugging log

    return {
      recipes: JSON.parse(JSON.stringify(allRecipes)), // Recipes for the current page
      totalRecipes, // Total number of recipes for pagination
    };
  } catch (error) {
    console.error("Error fetching all recipes:", error);
    throw error;
  }
};

export const getRecipesByUser = async (userId: string) => {
  try {
    await connect();

    // Find the user in DB (may contain clerkId)
    const user = await User.findById(userId)
      .lean<{ clerkId?: string }>()
      .exec();

    const conditions: any[] = [{ creator: userId }];

    // If the user has a clerkId, also match those legacy recipes
    if (user?.clerkId) {
      conditions.push({ creator: user.clerkId });
    }

    const recipes = await Recipe.find({ $or: conditions })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return JSON.parse(JSON.stringify(recipes));
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

export const deleteRecipe = async (recipeId: string) => {
  try {
    await connect();
    await Recipe.deleteOne({ _id: recipeId }).exec();
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
