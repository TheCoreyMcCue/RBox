import { Schema, model, models, Document, Types } from "mongoose";

export interface IRecipe extends Document {
  title: string;
  description: string;
  cookTime: string;
  image: string;
  ingredients: string[];
  steps: string[];
  category: string;
  createdAt: Date;
  creator: string; // Reference to the user who created the recipe
}

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
    type: [String],
    required: true,
  },
  steps: {
    type: [String],
    required: true,
  },
  category: {
    type: String,
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
