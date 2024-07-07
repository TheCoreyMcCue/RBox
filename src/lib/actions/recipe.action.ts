"use server";

import Recipe from "@/lib/modals/recipe.modal";
import { connect } from "@/lib/db";

export async function createRecipe(recipe: any) {
  try {
    await connect();
    const newRecipe = await Recipe.create(recipe);
    return JSON.parse(JSON.stringify(newRecipe));
  } catch (error) {
    console.log(error);
  }
}
