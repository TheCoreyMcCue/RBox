"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
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
    if (!recipeText.trim()) return;

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
        categories: Array.isArray(data.categories)
          ? data.categories
              .map((c: any) => String(c).trim().toLowerCase())
              .filter(Boolean)
          : [""],
      };

      setParsedValues(parsed);
      setShowManualForm(true);
    } catch (err: any) {
      setParseError(err.message || "Something went wrong while parsing.");
    } finally {
      setParsing(false);
    }
  };

  // --- AUTH GUARD ---
  if (!isSignedIn || !userId) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center px-4">
        <div className="max-w-md w-full bg-amber-50/90 backdrop-blur-sm border border-amber-200 rounded-3xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-[Homemade Apple] text-amber-800 mb-4">
            Sign in to add recipes
          </h2>
          <p className="text-amber-700 font-serif mb-6">
            Keep your favorite family recipes safe and organized. ✨
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-full text-lg font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // STEP 1: FREEFORM TEXT / URL INPUT
  // ─────────────────────────────────────────────
  if (!showManualForm) {
    return (
      <div className="min-h-[90vh] from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md border border-amber-200 rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl sm:text-5xl font-[Homemade Apple] text-amber-800">
              Add a New Recipe ✍️
            </h1>
            <p className="text-amber-700 font-serif text-sm sm:text-base">
              Paste a recipe from a blog or write it out freeform. We’ll help
              you organize it into Nana’s format.
            </p>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2 font-serif">
              Recipe text or link
            </label>
            <textarea
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
              rows={10}
              placeholder="Paste the full recipe here — ingredients, steps, or even a blog URL..."
              className="w-full p-4 rounded-2xl border border-amber-200 bg-amber-50/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-amber-900 font-serif resize-vertical"
            />
          </div>

          {parseError && (
            <p className="text-red-600 text-sm font-serif text-center">
              {parseError}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:justify-between pt-2">
            <button
              type="button"
              onClick={handleParse}
              disabled={parsing || !recipeText.trim()}
              className="flex-1 bg-gradient-to-r from-amber-700 to-amber-600 text-white py-3 px-6 rounded-full text-base font-semibold shadow-md hover:from-amber-800 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
            >
              {parsing ? "Organizing…" : "Organize Recipe"}
            </button>

            <button
              type="button"
              onClick={toggleFormView}
              className="flex-1 bg-white text-amber-800 border border-amber-300 py-3 px-6 rounded-full text-base font-semibold shadow-sm hover:bg-amber-50 transition-all duration-300"
            >
              Enter Manually Instead
            </button>
          </div>

          {/* Hint */}
          <p className="text-xs text-amber-600 font-serif text-center pt-2">
            You can always adjust everything in the next step before saving.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // STEP 2: STRUCTURED FORM (FORMIK)
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-[90vh] from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center px-4 py-10">
      <Formik
        initialValues={
          parsedValues
            ? JSON.parse(JSON.stringify(parsedValues)) // deep clone for Formik
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
              categories: values.categories
                .map((c) => c.trim())
                .filter(Boolean),
            };

            const newRecipe = await createRecipe(payload);

            if (newRecipe) {
              resetForm();
              router.push("/my-cookbook");
            }
          } catch (error) {
            console.error("❌ Error creating recipe:", error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form className="w-full max-w-3xl mx-auto space-y-8">
            {/* Top header card */}
            <div className="bg-white/90 backdrop-blur-md border border-amber-200 rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-[Homemade Apple] text-amber-800">
                  Review & Save 🍽️
                </h2>
                <p className="text-amber-700 font-serif text-sm sm:text-base mt-1">
                  Tweak anything you like before adding it to Nana’s Cookbook.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleFormView}
                className="self-start sm:self-auto inline-flex items-center gap-1 text-sm font-semibold text-amber-700 underline hover:text-amber-900"
              >
                ← Start over with text
              </button>
            </div>

            {/* TITLE + DESCRIPTION + COOK TIME */}
            <div className="bg-white/90 backdrop-blur-md border border-amber-200 rounded-3xl shadow-md p-6 sm:p-8 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-1 font-serif">
                  Recipe Title
                </label>
                <Field
                  name="title"
                  required
                  placeholder="Grandma’s Sunday Lasagna"
                  className="w-full rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-amber-900 font-serif focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-1 font-serif">
                  Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows={3}
                  required
                  placeholder="A cozy, layered pasta dish perfect for family dinners..."
                  className="w-full rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-amber-900 font-serif focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-vertical"
                />
              </div>

              {/* Cook Time */}
              <div className="max-w-xs">
                <label className="block text-sm font-semibold text-amber-800 mb-1 font-serif">
                  Cook Time (minutes)
                </label>
                <Field
                  name="cookTime"
                  type="number"
                  required
                  min={1}
                  placeholder="45"
                  className="w-full rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-amber-900 font-serif focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>
            </div>

            {/* IMAGE CARD */}
            <div className="bg-white/90 backdrop-blur-md border border-amber-200 rounded-3xl shadow-md p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-[Homemade Apple] text-amber-800">
                    Recipe Image 📷
                  </h3>
                  <p className="text-amber-700 font-serif text-sm mt-1">
                    Upload a photo so it looks beautiful in your cookbook.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <ImageUpload
                  setImage={(url: string) => setFieldValue("image", url)}
                />
              </div>
            </div>

            {/* INGREDIENTS CARD */}
            <FieldArray name="ingredients">
              {({ push, remove }) => (
                <div className="bg-white/90 backdrop-blur-md border border-amber-200 rounded-3xl shadow-md p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-[Homemade Apple] text-amber-800">
                      Ingredients 🥕
                    </h3>
                    <button
                      type="button"
                      onClick={() => push({ amount: "", unit: "", name: "" })}
                      className="text-sm font-semibold text-amber-700 underline hover:text-amber-900"
                    >
                      ➕ Add Ingredient
                    </button>
                  </div>

                  <div className="space-y-3">
                    {values.ingredients.map((_, index: number) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row gap-2 bg-amber-50/60 border border-amber-200 rounded-2xl p-3"
                      >
                        <div className="flex gap-2 sm:w-1/3">
                          <Field
                            name={`ingredients.${index}.amount`}
                            placeholder="Qty"
                            required
                            className="w-20 rounded-xl border border-amber-200 bg-white/80 px-2 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                          <Field
                            as="select"
                            name={`ingredients.${index}.unit`}
                            className="flex-1 rounded-xl border border-amber-200 bg-white/80 px-2 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-amber-400"
                          >
                            <option value="">Unit</option>
                            {unitOptions.map((opt: string) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </Field>
                        </div>

                        <div className="flex-1 flex gap-2">
                          <Field
                            name={`ingredients.${index}.name`}
                            placeholder="Ingredient"
                            required
                            className="flex-1 rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="self-center text-red-500 text-lg font-bold px-2"
                            aria-label="Remove ingredient"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FieldArray>

            {/* STEPS CARD */}
            <FieldArray name="steps">
              {({ push, remove }) => (
                <div className="bg-white/90 backdrop-blur-md border border-amber-200 rounded-3xl shadow-md p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-[Homemade Apple] text-amber-800">
                      Steps 👩‍🍳
                    </h3>
                    <button
                      type="button"
                      onClick={() => push("")}
                      className="text-sm font-semibold text-amber-700 underline hover:text-amber-900"
                    >
                      ➕ Add Step
                    </button>
                  </div>

                  <div className="space-y-3">
                    {values.steps.map((_, index: number) => (
                      <div
                        key={index}
                        className="flex gap-2 items-start bg-amber-50/60 border border-amber-200 rounded-2xl p-3"
                      >
                        <span className="mt-1 w-6 text-center font-semibold text-amber-700">
                          {index + 1}.
                        </span>
                        <Field
                          as="textarea"
                          name={`steps.${index}`}
                          placeholder="Describe this step..."
                          required
                          rows={2}
                          className="flex-1 rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-amber-400 resize-vertical"
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="mt-1 text-red-500 text-lg font-bold px-2"
                          aria-label="Remove step"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FieldArray>

            {/* CATEGORIES CARD */}
            <FieldArray name="categories">
              {({ push, remove }) => (
                <div className="bg-white/90 backdrop-blur-md border border-amber-200 rounded-3xl shadow-md p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-[Homemade Apple] text-amber-800">
                      Categories 🗂️
                    </h3>
                    <button
                      type="button"
                      onClick={() => push("")}
                      className="text-sm font-semibold text-amber-700 underline hover:text-amber-900"
                    >
                      ➕ Add Category
                    </button>
                  </div>

                  <div className="space-y-3">
                    {values.categories.map((_, index: number) => (
                      <div
                        key={index}
                        className="flex gap-2 items-center bg-amber-50/60 border border-amber-200 rounded-2xl p-3"
                      >
                        <Field
                          as="select"
                          name={`categories.${index}`}
                          className="flex-1 rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                          className="text-red-500 text-lg font-bold px-2"
                          aria-label="Remove category"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FieldArray>

            {/* ACTIONS CARD */}
            <div className="bg-white/90 backdrop-blur-md border border-amber-200 rounded-3xl shadow-md p-6 sm:p-8 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-amber-700 to-amber-600 text-white py-3 rounded-full text-base font-semibold shadow-md hover:from-amber-800 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSubmitting ? "Saving…" : "🍽️ Save Recipe"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/my-cookbook")}
                className="flex-1 bg-white text-amber-800 border border-amber-300 py-3 rounded-full text-base font-semibold shadow-sm hover:bg-amber-50 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateRecipe;
