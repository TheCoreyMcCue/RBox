import { Schema, model, models, Document } from "mongoose";

export interface IIngredient {
  amount: string;
  unit: string;
  name: string;
}

export interface IRecipe extends Document {
  title: string;
  description: string;
  cookTime: string;
  image: string;
  ingredients: IIngredient[];
  steps: string[];
  categories: string[];
  createdAt: Date;
  creator: string; // Reference to the user who created the recipe
}

const IngredientSchema = new Schema<IIngredient>({
  amount: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const RecipeSchema = new Schema<IRecipe>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  cookTime: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  ingredients: {
    type: [IngredientSchema],
    required: true,
  },
  steps: {
    type: [String],
    required: true,
  },
  categories: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  creator: {
    type: String,
    ref: "User", // Reference to User model
    required: true,
  },
});

const Recipe = models?.Recipe || model<IRecipe>("Recipe", RecipeSchema);

export default Recipe;
