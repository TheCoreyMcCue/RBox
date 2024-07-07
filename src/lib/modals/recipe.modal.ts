import { Schema, model, models, Document } from "mongoose";

export interface IRecipe extends Document {
  title: string;
  description: string;
  cookTime: string;
  image: string;
  ingredients: string[];
  steps: string[];
  category: string;
  createdAt: Date;
  creator: Schema.Types.ObjectId; // Reference to the user who created the recipe
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
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Recipe = models?.Recipe || model<IRecipe>("Recipe", RecipeSchema);

export default Recipe;
