"use server";

import Recipe from "@/lib/models/recipe.model";
import Category from "../models/category.model";
import User from "../models/user.model";
import { connect } from "@/lib/db";
import { Types } from "mongoose";

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

export const getRecipesByUser = async (userId: string) => {
  try {
    // Ensure the user ID is properly cast to ObjectId if needed
    await connect();
    const recipes = await Recipe.find({ creator: userId }).exec();
    return recipes;
  } catch (error) {
    console.error("Error fetching recipes by user:", error);
    throw error;
  }
};
