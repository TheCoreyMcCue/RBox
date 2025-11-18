export interface Ingredient {
  amount: string;
  unit: string;
  name: string;
}

export interface Recipe {
  _id: string;
  title: string;
  creator: string;
  description: string;
  image: string;
  cookTime: string;
  ingredients: Ingredient[];
  steps: string[];
  categories: string[];
}
