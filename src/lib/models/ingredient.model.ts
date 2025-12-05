import { Schema, model, models, Document } from "mongoose";

export interface IIngredient extends Document {
  amount: string;
  unit: string;
  name: string;
}

const IngredientSchema = new Schema<IIngredient>({
  amount: {
    type: String,
    required: false,
  },
  unit: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
});

const Ingredient =
  models?.Ingredient || model<IIngredient>("Ingredient", IngredientSchema);

export default Ingredient;
