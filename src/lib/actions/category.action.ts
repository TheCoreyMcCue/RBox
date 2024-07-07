"use server";

import { connect } from "@/lib/db";
import Category from "../models/category.model";

type CreateCategoryParams = {
  categoryName: string;
};

const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};

export const createCategory = async ({
  categoryName,
}: CreateCategoryParams) => {
  try {
    await connect();

    const newCategory = await Category.create({ name: categoryName });

    return JSON.parse(JSON.stringify(newCategory));
  } catch (error) {
    handleError(error);
  }
};

export const getAllCategories = async () => {
  try {
    await connect();

    const categories = await Category.find();

    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    handleError(error);
  }
};
