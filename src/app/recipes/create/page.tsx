"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Formik, Field, Form, FieldArray } from "formik";
import { createRecipe } from "@/lib/actions/recipe.action";
import ImageUpload from "@/app/components/ImageUpload";
import { unitOptions } from "@/app/utils/data";

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
  const router = useRouter();
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const isLoading = status === "loading";

  const userId: string | undefined =
    (session?.user as any)?._id || (session?.user as any)?.clerkId;

  const [showManualForm, setShowManualForm] = useState(false);
  const [recipeText, setRecipeText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
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
      if (!res.ok) throw new Error(data.error || "Failed to parse recipe");

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

  if (isLoading) {
    return <div className="text-center mt-10 text-amber-700">Loading...</div>;
  }

  if (!isSignedIn || !userId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center">
        <h2 className="text-4xl font-[Homemade Apple] text-amber-800 mb-4">
          You must be signed in to create a recipe
        </h2>
        <p className="text-amber-700 font-serif mb-6">
          Sign in to start adding your family favorites 🍳
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
        >
          Go Home
        </button>
      </div>
    );
  }

  // 🧡 Step 1: Paste or type recipe text
  if (!showManualForm) {
    return (
      <div className="max-w-3xl mx-auto bg-amber-50/90 backdrop-blur-md border border-amber-200 p-12 my-12 rounded-3xl shadow-lg">
        <h2 className="text-4xl font-[Homemade Apple] text-amber-800 mb-6 text-center">
          Add Your Recipe ✍️
        </h2>
        <p className="text-amber-700 text-center font-serif mb-6">
          Paste or type your full recipe text below. Include the title,
          ingredients, and steps — we’ll organize it for you.
        </p>

        <textarea
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          placeholder={`Example:\nGrandma’s Apple Pie\n\nIngredients:\n- 3 apples\n- 1 cup sugar\n- 2 tbsp butter\n\nSteps:\n1. Preheat oven to 350°F.\n2. Slice apples...\n3. Bake until golden.`}
          rows={14}
          className="w-full p-4 border border-amber-200 rounded-xl mb-6 bg-white/90 focus:ring-2 focus:ring-amber-400 focus:outline-none text-amber-900 placeholder:text-amber-400 shadow-inner resize-none"
        />

        {parseError && (
          <p className="text-red-600 mb-4 text-center font-medium">
            {parseError}
          </p>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={handleParse}
            disabled={parsing || !recipeText.trim()}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
          >
            {parsing ? "Organizing Recipe..." : "Organize Recipe"}
          </button>
          <button
            onClick={toggleFormView}
            className="w-full sm:w-auto bg-amber-200 text-amber-800 py-3 px-8 rounded-full text-lg font-semibold hover:bg-amber-300 transition-all duration-300"
          >
            Enter Manually
          </button>
        </div>
      </div>
    );
  }

  // 🧡 Step 2: Manual or organized form
  return (
    <Formik<RecipeFormValues>
      initialValues={parsedValues || defaultInitialValues}
      enableReinitialize
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          const newRecipe = await createRecipe({
            creator: userId,
            ...values,
          });

          if (newRecipe) {
            resetForm();
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Error creating recipe:", error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="min-h-screen overflow-y-auto max-w-3xl mx-auto bg-amber-50/90 backdrop-blur-md border border-amber-200 p-12 my-12 rounded-3xl shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-[Homemade Apple] text-amber-800">
              Review & Save 🍽️
            </h2>
            <button
              type="button"
              onClick={toggleFormView}
              className="text-amber-600 hover:text-amber-800 underline"
            >
              Back
            </button>
          </div>

          {/* Title */}
          <div className="mb-5">
            <label className="block font-semibold mb-2 text-amber-800">
              Recipe Title
            </label>
            <Field
              name="title"
              className="w-full px-4 py-3 border border-amber-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-amber-400 focus:outline-none text-amber-900 placeholder:text-amber-400"
              required
              placeholder="e.g., Grandma’s Apple Pie"
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block font-semibold mb-2 text-amber-800">
              Description
            </label>
            <Field
              as="textarea"
              name="description"
              rows={3}
              className="w-full px-4 py-3 border border-amber-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-amber-400 focus:outline-none text-amber-900 placeholder:text-amber-400"
              required
              placeholder="A short note about the recipe..."
            />
          </div>

          {/* Cook Time */}
          <div className="mb-5">
            <label className="block font-semibold mb-2 text-amber-800">
              Cook Time (minutes)
            </label>
            <Field
              name="cookTime"
              type="number"
              className="w-full px-4 py-3 border border-amber-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-amber-400 focus:outline-none text-amber-900"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <label className="block font-semibold mb-2 text-amber-800">
              Recipe Image
            </label>
            <ImageUpload setImage={(url) => setFieldValue("image", url)} />
          </div>

          {/* Ingredients */}
          <FieldArray name="ingredients">
            {({ push, remove }) => (
              <div className="mb-8">
                <label className="block font-semibold mb-3 text-amber-800">
                  Ingredients
                </label>
                {values.ingredients.map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2"
                  >
                    <Field
                      name={`ingredients.${index}.amount`}
                      placeholder="Qty"
                      className="w-full sm:w-1/4 px-3 py-2 border border-amber-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-amber-400"
                      required
                    />
                    <Field
                      as="select"
                      name={`ingredients.${index}.unit`}
                      className="w-full sm:w-1/4 px-3 py-2 border border-amber-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-amber-400"
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
                      className="w-full sm:flex-1 px-3 py-2 border border-amber-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-amber-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 font-bold hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => push({ amount: "", unit: "", name: "" })}
                  className="mt-3 text-amber-700 hover:underline font-medium"
                >
                  ➕ Add Ingredient
                </button>
              </div>
            )}
          </FieldArray>

          {/* Steps */}
          <FieldArray name="steps">
            {({ push, remove }) => (
              <div className="mb-8">
                <label className="block font-semibold mb-3 text-amber-800">
                  Steps
                </label>
                {values.steps.map((_, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <Field
                      name={`steps.${index}`}
                      placeholder="Describe this step..."
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-amber-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="ml-2 text-red-600 font-bold hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => push("")}
                  className="mt-3 text-amber-700 hover:underline font-medium"
                >
                  ➕ Add Step
                </button>
              </div>
            )}
          </FieldArray>

          {/* Categories */}
          <FieldArray name="categories">
            {({ push, remove }) => (
              <div className="mb-10">
                <label className="block font-semibold mb-3 text-amber-800">
                  Categories
                </label>
                {values.categories.map((_, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <Field
                      name={`categories.${index}`}
                      placeholder="Category"
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="ml-2 text-red-600 font-bold hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => push("")}
                  className="mt-3 text-amber-700 hover:underline font-medium"
                >
                  ➕ Add Category
                </button>
              </div>
            )}
          </FieldArray>

          {/* Submit */}
          <div className="flex justify-between space-x-4 mt-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-full text-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60"
            >
              🍽️ Save Recipe
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-1 bg-amber-200 text-amber-800 py-3 rounded-full text-lg font-semibold hover:bg-amber-300 transition-all duration-300 shadow-sm"
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
