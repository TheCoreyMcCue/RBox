"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Formik, Field, Form, FieldArray, FormikHelpers } from "formik";
import { createRecipe } from "@/lib/actions/recipe.action";
import ImageUpload from "@/app/components/ImageUpload";
import { unitOptions, CATEGORY_OPTIONS } from "@/app/utils/data";

// ---------- Types ----------
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

  const userId: string | undefined =
    (session?.user as any)?._id || (session?.user as any)?.clerkId;

  // --- PARSING UI STATE ---
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
    setParsedValues(null);
    setRecipeText("");
  };

  // --- PARSER CALL ---
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
      if (!res.ok) throw new Error(data.error || "Parsing failed");

      const parsed: RecipeFormValues = {
        title: data.title || "",
        description: data.description || "",
        cookTime:
          typeof data.cookTime === "number"
            ? String(data.cookTime)
            : data.cookTime?.toString() || "",
        image: "",
        ingredients: Array.isArray(data.ingredients)
          ? data.ingredients
          : defaultInitialValues.ingredients,
        steps: Array.isArray(data.steps)
          ? data.steps
          : defaultInitialValues.steps,

        // ⭐ Correct auto categories → fully cleaned
        categories: Array.isArray(data.categories)
          ? data.categories
              .map((c: any) => String(c).trim().toLowerCase())
              .filter(Boolean)
          : [""],
      };

      setParsedValues(parsed);
      setShowManualForm(true);
    } catch (err: any) {
      setParseError(err.message);
    } finally {
      setParsing(false);
    }
  };

  // --- AUTH GUARD ---
  if (!isSignedIn || !userId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
        <h2>You must be signed in to create a recipe</h2>
      </div>
    );
  }

  // --- STEP 1: TEXT INPUT ---
  if (!showManualForm) {
    return (
      <div className="max-w-3xl mx-auto bg-amber-50/90 p-12 rounded-3xl shadow-lg my-12">
        <h2 className="text-4xl font-[Homemade Apple] text-amber-800 text-center mb-6">
          Add Your Recipe ✍️
        </h2>

        <textarea
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          rows={14}
          placeholder="Paste recipe here..."
          className="w-full p-4 border rounded-xl mb-6 bg-white/90"
        />

        {parseError && (
          <p className="text-red-600 text-center mb-4">{parseError}</p>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={handleParse}
            disabled={parsing || !recipeText.trim()}
            className="bg-amber-700 text-white px-8 py-3 rounded-full shadow-lg disabled:opacity-60"
          >
            {parsing ? "Parsing..." : "Organize Recipe"}
          </button>

          <button
            onClick={toggleFormView}
            className="bg-amber-200 px-8 py-3 rounded-full"
          >
            Enter Manually
          </button>
        </div>
      </div>
    );
  }

  // --- STEP 2: STRUCTURED FORM ---
  return (
    <Formik
      initialValues={
        parsedValues
          ? JSON.parse(JSON.stringify(parsedValues)) // ⭐ Deep-clone to force Formik FieldArray refresh
          : defaultInitialValues
      }
      enableReinitialize
      onSubmit={async (
        values: RecipeFormValues,
        { setSubmitting, resetForm }: FormikHelpers<RecipeFormValues>
      ) => {
        try {
          const payload = {
            creator: userId,
            title: values.title.trim(),
            description: values.description.trim(),
            cookTime: values.cookTime.trim(),
            image: values.image,

            ingredients: values.ingredients.map((ing) => ({
              amount: ing.amount.trim(),
              unit: ing.unit.trim(),
              name: ing.name.trim(),
            })),

            steps: values.steps.map((s) => s.trim()),

            // ⭐ Store under `category` field for database
            categories: values.categories.map((c) => c.trim()).filter(Boolean),
          };

          const newRecipe = await createRecipe(payload);

          if (newRecipe) {
            resetForm();
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("❌ Error creating recipe:", error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="max-w-3xl mx-auto bg-amber-50/90 p-12 rounded-3xl shadow-lg my-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-[Homemade Apple] text-amber-800">
              Review & Save 🍽️
            </h2>

            <button
              type="button"
              onClick={toggleFormView}
              className="underline text-amber-600"
            >
              Back
            </button>
          </div>

          {/* TITLE */}
          <div className="mb-5">
            <label>Recipe Title</label>
            <Field
              name="title"
              required
              className="w-full p-3 border rounded-lg bg-white/80"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-5">
            <label>Description</label>
            <Field
              as="textarea"
              name="description"
              rows={3}
              required
              className="w-full p-3 border rounded-lg bg-white/80"
            />
          </div>

          {/* COOK TIME */}
          <div className="mb-5">
            <label>Cook Time (minutes)</label>
            <Field
              name="cookTime"
              type="number"
              required
              className="w-full p-3 border rounded-lg bg-white/80"
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div className="mb-8">
            <label>Recipe Image</label>
            <ImageUpload
              setImage={(url: string) => setFieldValue("image", url)}
            />
          </div>

          {/* INGREDIENTS */}
          <FieldArray name="ingredients">
            {({ push, remove }) => (
              <div className="mb-8">
                <label>Ingredients</label>

                {values.ingredients.map((_: Ingredient, index: number) => (
                  <div
                    key={index}
                    className="flex gap-2 mb-2 flex-col sm:flex-row"
                  >
                    <Field
                      name={`ingredients.${index}.amount`}
                      placeholder="Qty"
                      required
                      className="p-2 border rounded-lg bg-white/80"
                    />

                    <Field
                      as="select"
                      name={`ingredients.${index}.unit`}
                      className="p-2 border rounded-lg bg-white/80"
                    >
                      <option value="">Unit</option>
                      {unitOptions.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Field>

                    <Field
                      name={`ingredients.${index}.name`}
                      placeholder="Ingredient"
                      required
                      className="flex-1 p-2 border rounded-lg bg-white/80"
                    />

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => push({ amount: "", unit: "", name: "" })}
                  className="text-amber-700 underline"
                >
                  ➕ Add Ingredient
                </button>
              </div>
            )}
          </FieldArray>

          {/* STEPS */}
          <FieldArray name="steps">
            {({ push, remove }) => (
              <div className="mb-8">
                <label>Steps</label>

                {values.steps.map((_: string, index: number) => (
                  <div key={index} className="flex items-center mb-2">
                    <Field
                      name={`steps.${index}`}
                      placeholder="Describe step..."
                      required
                      className="w-full p-2 border rounded-lg bg-white/80"
                    />

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 ml-2 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => push("")}
                  className="text-amber-700 underline"
                >
                  ➕ Add Step
                </button>
              </div>
            )}
          </FieldArray>

          {/* CATEGORIES */}
          <FieldArray name="categories">
            {({ push, remove }) => (
              <div className="mb-10">
                <label>Categories</label>

                {values.categories.map((_: string, index: number) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <Field
                      as="select"
                      name={`categories.${index}`}
                      className="w-full p-2 border bg-white/80 rounded-lg"
                    >
                      <option value="">Select a category</option>

                      {Object.entries(CATEGORY_OPTIONS).map(
                        ([groupName, options]) => (
                          <optgroup
                            key={groupName}
                            label={groupName
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          >
                            {options.map((opt: string) => (
                              <option key={opt} value={opt}>
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                              </option>
                            ))}
                          </optgroup>
                        )
                      )}
                    </Field>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => push("")}
                  className="text-amber-700 underline"
                >
                  ➕ Add Category
                </button>
              </div>
            )}
          </FieldArray>

          {/* SUBMIT */}
          <div className="flex justify-between mt-10 gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-amber-700 text-white py-3 rounded-full shadow-md disabled:opacity-60"
            >
              🍽️ Save Recipe
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-1 bg-amber-200 py-3 rounded-full"
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
