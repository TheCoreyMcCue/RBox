import { Dispatch, SetStateAction } from "react";
import { Ingredient } from "./types"; // Import the Ingredient type

// Define and export the handleStepChange function
export const handleStepChange = (
  steps: string[],
  setSteps: React.Dispatch<React.SetStateAction<string[]>>,
  index: number,
  value: string
) => {
  const newSteps = [...steps];
  newSteps[index] = value;
  setSteps(newSteps);
};

// Define and export the handleIngredientChange function
export const handleIngredientChange = (
  ingredients: Ingredient[],
  setIngredients: Dispatch<SetStateAction<Ingredient[]>>,
  index: number,
  field: keyof Ingredient,
  value: string
) => {
  const newIngredients = [...ingredients];
  newIngredients[index] = {
    ...newIngredients[index],
    [field]: value,
  };
  setIngredients(newIngredients);
};
