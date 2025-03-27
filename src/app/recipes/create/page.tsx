"use client";

import { useState } from "react";
import { Formik, Field, Form, FieldArray } from "formik";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createRecipe } from "@/lib/actions/recipe.action";
import ImageUpload from "@/app/components/ImageUpload";
import { unitOptions } from "@/app/utils/data";

// Define types for the recipe form
interface Ingredient {
  amount: string;
  unit: string;
  name: string;
}

interface RecipeFormValues {
  title: string;
  description: string;
  cookTime: string;
  image: string;
  ingredients: Ingredient[];
  steps: string[];
  categories: string[];
}

const defaultInitialValues: RecipeFormValues = {
  title: "",
  description: "",
  cookTime: "",
  image: "",
  ingredients: [{ amount: "", unit: "", name: "" }],
  steps: [""],
  categories: [""],
};

const CreateRecipe = () => {
  const { user } = useUser();
  const router = useRouter();

  const [showManualForm, setShowManualForm] = useState<boolean>(false);
  const [recipeText, setRecipeText] = useState<string>("");
  const [parsing, setParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string>("");
  const [parsedValues, setParsedValues] = useState<RecipeFormValues | null>(
    null
  );

  const toggleFormView = () => {
    setShowManualForm((prev) => !prev);
    setParseError("");
    setRecipeText("");
    setParsedValues(null);
  };

  const handleParse = async () => {
    setParsing(true);
    setParseError("");

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeText }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse recipe");
      }

      // Set values with fallback/defaults
      const parsed: RecipeFormValues = {
        title: data.title || "",
        description: data.description || "",
        cookTime: data.cookTime?.toString() || "",
        image: "",
        ingredients: Array.isArray(data.ingredients)
          ? data.ingredients
          : defaultInitialValues.ingredients,
        steps: Array.isArray(data.steps)
          ? data.steps
          : defaultInitialValues.steps,
        categories: defaultInitialValues.categories,
      };

      setParsedValues(parsed);
      setShowManualForm(true);
    } catch (err: any) {
      setParseError(err.message || "Something went wrong while parsing.");
    } finally {
      setParsing(false);
    }
  };

  if (!showManualForm) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 my-3 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Paste a Recipe or URL
        </h2>
        <textarea
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          placeholder="Paste a recipe or URL here..."
          rows={8}
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:border-blue-500"
        />
        {parseError && <p className="text-red-500 mb-2">{parseError}</p>}
        <div className="flex justify-between gap-4">
          <button
            onClick={handleParse}
            disabled={parsing || !recipeText.trim()}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            {parsing ? "Parsing..." : "Parse Recipe"}
          </button>
          <button
            onClick={toggleFormView}
            className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Enter Manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <Formik<RecipeFormValues>
      initialValues={parsedValues || defaultInitialValues}
      enableReinitialize
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          const newRecipe = await createRecipe({
            creator: user?.id,
            ...values,
          });
          if (newRecipe) {
            resetForm();
            router.push(`/dashboard`);
          }
        } catch (error) {
          console.error("Error creating recipe:", error);
        }
        setSubmitting(false);
      }}
    >
      {({ values, setFieldValue }) => (
        <Form className="min-h-screen overflow-y-auto max-w-2xl mx-auto bg-white p-8 my-3 rounded-2xl shadow-md">
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={toggleFormView}
              className="text-blue-500 hover:underline"
            >
              Back to Text Input
            </button>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Title</label>
            <Field
              name="title"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Description
            </label>
            <Field
              as="textarea"
              name="description"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Cook Time */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Cook Time (minutes)
            </label>
            <Field
              name="cookTime"
              type="number"
              inputMode="decimal"
              pattern="^\\d+(\\.\\d+)?$"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Image URL
            </label>
            <ImageUpload setImage={(url) => setFieldValue("image", url)} />
          </div>

          {/* Ingredients */}
          <FieldArray name="ingredients">
            {({ push, remove }) => (
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Ingredients
                </label>
                {values.ingredients.map((_, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <Field
                      name={`ingredients.${index}.amount`}
                      placeholder="Qty"
                      className="w-1/3 px-3 py-2 mr-2 border rounded-lg"
                      required
                    />
                    <Field
                      as="select"
                      name={`ingredients.${index}.unit`}
                      className="w-1/2 px-3 py-2 mr-2 border rounded-lg"
                      required
                    >
                      <option value="" disabled>
                        Select Unit
                      </option>
                      {unitOptions.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </Field>
                    <Field
                      name={`ingredients.${index}.name`}
                      placeholder="Ingredient"
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-500"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => push({ amount: "", unit: "", name: "" })}
                  className="text-blue-500 hover:underline mt-2"
                >
                  Add Ingredient
                </button>
              </div>
            )}
          </FieldArray>

          {/* Steps */}
          <FieldArray name="steps">
            {({ push, remove }) => (
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Steps
                </label>
                {values.steps.map((_, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <Field
                      name={`steps.${index}`}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-500"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => push("")}
                  className="text-blue-500 hover:underline mt-2"
                >
                  Add Step
                </button>
              </div>
            )}
          </FieldArray>

          {/* Categories */}
          <FieldArray name="categories">
            {({ push, remove }) => (
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Categories
                </label>
                {values.categories.map((_, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <Field
                      name={`categories.${index}`}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-500"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => push("")}
                  className="text-blue-500 hover:underline mt-2"
                >
                  Add Category
                </button>
              </div>
            )}
          </FieldArray>

          {/* Submit */}
          <div className="flex justify-between space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Create Recipe
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
            >
              Cancel
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CreateRecipe;
