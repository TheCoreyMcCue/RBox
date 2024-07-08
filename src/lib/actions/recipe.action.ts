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

export const deleteRecipe = async (recipeId: string, userId: string) => {
  try {
    await connect();

    // Ensure the recipe belongs to the user
    const recipe = await Recipe.findOne({ _id: recipeId, creator: userId });

    if (!recipe) {
      throw new Error(
        "Recipe not found or you do not have permission to delete this recipe."
      );
    }

    await Recipe.deleteOne({ _id: recipeId });
    return { message: "Recipe deleted successfully" };
  } catch (error) {
    console.error("Error deleting recipe:", error);
    throw error;
  }
};

// export async function updateEvent({ userId, event, path }: UpdateEventParams) {
//   try {
//     await connectToDatabase()

//     const eventToUpdate = await Event.findById(event._id)
//     if (!eventToUpdate || eventToUpdate.organizer.toHexString() !== userId) {
//       throw new Error('Unauthorized or event not found')
//     }

//     const updatedEvent = await Event.findByIdAndUpdate(
//       event._id,
//       { ...event, category: event.categoryId },
//       { new: true }
//     )
//     revalidatePath(path)

//     return JSON.parse(JSON.stringify(updatedEvent))
//   } catch (error) {
//     handleError(error)
//   }
// }
