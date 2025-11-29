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

// ---------- Unit Normalizer ----------
const normalizeUnit = (raw?: string | null): string => {
  if (!raw) return "";
  let u = raw.toLowerCase().trim();

  if (u.endsWith(".")) u = u.slice(0, -1);
  if (u.endsWith("s") && !["tbs", "tsp"].includes(u)) {
    u = u.replace(/s$/, "");
  }
  if (["tsp", "teaspoon", "tea spoon", "ts"].includes(u)) return "tsp";
  if (["tbsp", "tbl", "tablespoon", "table spoon", "tb"].includes(u))
    return "tbsp";
  if (["c", "cup"].includes(u)) return "cup";

  return u;
};

// ---------- Normalize the parsed recipe ----------
const normalizeParsedRecipe = (raw: any): RecipeFormValues => {
  return {
    title: raw?.title || "",
    description: raw?.description || "",
    cookTime:
      typeof raw?.cookTime === "number"
        ? String(raw.cookTime)
        : raw?.cookTime?.toString() || "",
    image: "",
    ingredients:
      Array.isArray(raw?.ingredients) && raw.ingredients.length > 0
        ? raw.ingredients.map((ing: any) => ({
            amount: ing?.amount?.toString?.() || "",
            unit: normalizeUnit(ing?.unit),
            name: ing?.name?.toString?.() || "",
          }))
        : defaultInitialValues.ingredients,
    steps:
      Array.isArray(raw?.steps) && raw.steps.length > 0
        ? raw.steps.map((s: any) => s?.toString?.() || "")
        : defaultInitialValues.steps,
    categories:
      Array.isArray(raw?.categories) && raw.categories.length > 0
        ? raw.categories
            .map((c: any) => String(c).trim().toLowerCase())
            .filter(Boolean)
        : [""],
  };
};

const CreateRecipe = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";

  const userId: string | undefined =
    (session?.user as any)?._id || (session?.user as any)?.clerkId;

  // --- STATE ---
  const [showManualForm, setShowManualForm] = useState(false);
  const [recipeText, setRecipeText] = useState("");
  const [parsingText, setParsingText] = useState(false);
  const [parsingImage, setParsingImage] = useState(false);
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

  // --- TEXT PARSER CALL (/api/parse) ---
  const handleParse = async () => {
    if (!recipeText.trim()) return;

    setParsingText(true);
    setParseError("");

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Parsing failed");

      const parsed = normalizeParsedRecipe(data);
      setParsedValues(parsed);
      setShowManualForm(true);
    } catch (err: any) {
      console.error("❌ Text Parse Error:", err);
      setParseError(err.message);
    } finally {
      setParsingText(false);
    }
  };

  // --- IMAGE PARSER CALL (/api/parse-image) ---
  const handleImageParse = async (file: File) => {
    try {
      setParsingImage(true);
      setParseError("");

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/parse-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse image");

      const normalized = normalizeParsedRecipe(data);
      setParsedValues(normalized);
      setShowManualForm(true);
    } catch (error: any) {
      console.error("❌ OCR Parse Error:", error);
      setParseError(error.message);
    } finally {
      setParsingImage(false);
    }
  };

  // --- AUTH GUARD ---
  if (!isSignedIn || !userId) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-amber-50/90 border border-amber-200 rounded-3xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-[Homemade Apple] text-amber-800 mb-4">
            Sign in to add recipes
          </h2>
          <button
            onClick={() => signIn("google")}
            className="w-full bg-amber-700 text-white py-3 rounded-full"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // STEP 1 — TEXT + SCREENSHOT INPUT
  // ─────────────────────────────────────────────
  if (!showManualForm) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl bg-white/90 border border-amber-200 rounded-3xl shadow-xl p-6 sm:p-10 space-y-8">
          <h1 className="text-center text-4xl font-[Homemade Apple] text-amber-800">
            Add a New Recipe ✍️
          </h1>

          {/* TEXT INPUT */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              Recipe text or link
            </label>
            <textarea
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
              rows={10}
              className="w-full p-4 rounded-2xl border border-amber-200 bg-amber-50/60"
              placeholder="Paste the full recipe here..."
            />
          </div>

          {/* SCREENSHOT UPLOAD (FIXED — no 'no file chosen') */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              Or upload a screenshot of a recipe
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageParse(file);
                  e.target.value = ""; // allow picking same file
                }
              }}
              className="
                block w-full text-sm 
                file:bg-amber-100 file:rounded-full 
                file:px-4 file:py-2 file:border-0 
                file:text-amber-800 hover:file:bg-amber-200
                file:text-sm file:font-medium
                text-transparent
              "
              style={{
                color: "transparent",
              }}
            />

            {parsingImage && (
              <p className="text-xs text-amber-600 mt-1">
                Reading your screenshot…
              </p>
            )}
          </div>

          {parseError && (
            <p className="text-red-600 text-sm text-center">{parseError}</p>
          )}

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={handleParse}
              disabled={parsingText || !recipeText.trim()}
              className="flex-1 bg-amber-700 text-white py-3 rounded-full disabled:opacity-60"
            >
              {parsingText ? "Organizing…" : "Organize Recipe"}
            </button>

            <button
              type="button"
              onClick={toggleFormView}
              className="flex-1 border border-amber-300 py-3 rounded-full"
            >
              Enter Manually Instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // STEP 2 — STRUCTURED FORM
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-[90vh] px-4 py-10">
      <Formik
        initialValues={
          parsedValues
            ? JSON.parse(JSON.stringify(parsedValues))
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
              cookTime: String(values.cookTime || "").trim(),
              image: values.image,
              ingredients: values.ingredients
                .map((i) => ({
                  amount: i.amount.trim(),
                  unit: i.unit.trim(),
                  name: i.name.trim(),
                }))
                .filter((i) => i.name.length > 0),
              steps: values.steps.map((s) => s.trim()),
              categories: values.categories
                .map((c) => c.trim())
                .filter(Boolean),
            };

            const newRecipe = await createRecipe(payload);
            if (newRecipe) {
              resetForm();

              // 🔥 Force Next.js to invalidate the cached SSR result
              router.refresh();

              // 🔥 After the refresh propagates, navigate to the page
              setTimeout(() => {
                router.push("/my-cookbook");
              }, 50);
            }
          } catch (err) {
            console.error("❌ Error creating recipe:", err);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form className="w-full max-w-3xl mx-auto space-y-8">
            {/* HEADER CARD */}
            <div className="bg-white/90 border border-amber-200 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-center">
              <h2 className="text-3xl font-[Homemade Apple] text-amber-800">
                Review & Save 🍽️
              </h2>
              <button
                type="button"
                onClick={toggleFormView}
                className="text-sm underline text-amber-700"
              >
                ← Start over
              </button>
            </div>

            {/* TITLE / DESCRIPTION / TIME */}
            <div className="bg-white/90 border border-amber-200 rounded-3xl p-6 shadow">
              <label className="block font-semibold text-amber-800 mb-1">
                Recipe Title
              </label>
              <Field
                name="title"
                required
                className="w-full border border-amber-200 rounded-xl p-3 mb-4"
              />

              <label className="block font-semibold text-amber-800 mb-1">
                Description
              </label>
              <Field
                as="textarea"
                name="description"
                rows={3}
                required
                className="w-full border border-amber-200 rounded-xl p-3 mb-4"
              />

              <label className="block font-semibold text-amber-800 mb-1">
                Cook Time (minutes)
              </label>
              <Field
                name="cookTime"
                type="number"
                required
                min={1}
                className="w-full max-w-xs border border-amber-200 rounded-xl p-3"
              />
            </div>

            {/* IMAGE UPLOAD */}
            <div className="bg-white/90 border border-amber-200 rounded-3xl p-6 shadow">
              <h3 className="text-xl font-[Homemade Apple] text-amber-800 mb-2">
                Recipe Image 📷
              </h3>
              <ImageUpload
                setImage={(url: string) => setFieldValue("image", url)}
              />
            </div>

            {/* INGREDIENTS */}
            <FieldArray name="ingredients">
              {({ push, remove }) => (
                <div className="bg-white/90 border border-amber-200 rounded-3xl p-6 shadow">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-[Homemade Apple] text-amber-800">
                      Ingredients 🥕
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        push({
                          amount: "",
                          unit: "",
                          name: "",
                        })
                      }
                      className="text-sm underline text-amber-700"
                    >
                      ➕ Add Ingredient
                    </button>
                  </div>

                  <p className="text-xs text-amber-700 mb-2">
                    Amount and unit are optional — you can leave them blank for
                    things like "salt" or "pepper to taste".
                  </p>

                  <div className="space-y-3">
                    {values.ingredients.map((_, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row gap-2 border border-amber-200 p-3 rounded-xl bg-amber-50/40"
                      >
                        <Field
                          name={`ingredients.${index}.amount`}
                          placeholder="Qty"
                          className="w-20 border border-amber-200 rounded-xl p-2"
                        />

                        <Field
                          as="select"
                          name={`ingredients.${index}.unit`}
                          className="w-32 border border-amber-200 rounded-xl p-2"
                        >
                          <option value="">Unit</option>
                          {unitOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </Field>

                        <Field
                          name={`ingredients.${index}.name`}
                          className="flex-1 border border-amber-200 rounded-xl p-2"
                        />

                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 font-bold text-lg px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FieldArray>

            {/* STEPS */}
            <FieldArray name="steps">
              {({ push, remove }) => (
                <div className="bg-white/90 border border-amber-200 rounded-3xl p-6 shadow">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-[Homemade Apple] text-amber-800">
                      Steps 👩‍🍳
                    </h3>
                    <button
                      type="button"
                      onClick={() => push("")}
                      className="text-sm underline text-amber-700"
                    >
                      ➕ Add Step
                    </button>
                  </div>

                  <div className="space-y-3">
                    {values.steps.map((_, index) => (
                      <div
                        key={index}
                        className="flex gap-2 items-start border border-amber-200 p-3 rounded-xl bg-amber-50/40"
                      >
                        <span className="pt-2 text-amber-700">
                          {index + 1}.
                        </span>
                        <Field
                          as="textarea"
                          name={`steps.${index}`}
                          rows={2}
                          className="flex-1 border border-amber-200 rounded-xl p-2"
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 font-bold text-lg px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FieldArray>

            {/* CATEGORIES */}
            <FieldArray name="categories">
              {({ push, remove }) => (
                <div className="bg-white/90 border border-amber-200 rounded-3xl p-6 shadow">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-[Homemade Apple] text-amber-800">
                      Categories 🗂️
                    </h3>
                    <button
                      type="button"
                      onClick={() => push("")}
                      className="text-sm underline text-amber-700"
                    >
                      ➕ Add Category
                    </button>
                  </div>

                  <div className="space-y-3">
                    {values.categories.map((_, index) => (
                      <div
                        key={index}
                        className="flex gap-2 border border-amber-200 p-3 rounded-xl bg-amber-50/40"
                      >
                        <Field
                          as="select"
                          name={`categories.${index}`}
                          className="flex-1 border border-amber-200 rounded-xl p-2"
                        >
                          <option value="">Select category</option>
                          {Object.entries(CATEGORY_OPTIONS).map(
                            ([group, opts]) => (
                              <optgroup
                                key={group}
                                label={group
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (s) => s.toUpperCase())}
                              >
                                {opts.map((opt) => (
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
                          className="text-red-500 font-bold text-lg px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FieldArray>

            {/* SUBMIT */}
            <div className="bg-white/90 border border-amber-200 rounded-3xl p-6 shadow flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-amber-700 text-white py-3 rounded-full disabled:opacity-60"
              >
                {isSubmitting ? "Saving…" : "🍽️ Save Recipe"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/my-cookbook")}
                className="flex-1 border border-amber-300 py-3 rounded-full"
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
