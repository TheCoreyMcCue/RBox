"use client";

import { Formik, Field, Form, FieldArray } from "formik";
import { createRecipe } from "@/lib/actions/recipe.action";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import ImageUpload from "@/app/components/ImageUpload";
import { unitOptions } from "@/app/utils/data";

const CreateRecipe = () => {
  const { user } = useUser();
  const router = useRouter();

  return (
    <Formik
      initialValues={{
        title: "",
        description: "",
        cookTime: "",
        image: "",
        ingredients: [{ amount: "", unit: "", name: "" }],
        steps: [""],
        categories: [""],
      }}
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
        <Form className="max-w-2xl mx-auto bg-white p-8 my-3 rounded-2xl shadow-md">
          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Title</label>
            <Field
              name="title"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Description Input */}
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

          {/* Cook Time Input */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Cook Time (minutes)
            </label>
            <Field
              name="cookTime"
              type="text"
              inputMode="decimal"
              pattern="^(?:\d+(?:[.,]?\d*)?|\d+\s*\/\s*\d+)$"
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

          {/* Ingredients Section */}
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
                      className="w-1/3 px-3 py-2 mr-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                    <Field
                      as="select"
                      name={`ingredients.${index}.unit`}
                      className="w-1/2 px-3 py-2 mr-2 border rounded-lg focus:outline-none focus:border-blue-500"
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
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition duration-200 focus:outline-none"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => push({ amount: "", unit: "", name: "" })}
                  className="flex items-center mt-2 text-blue-500 hover:text-blue-700 transition duration-200 focus:outline-none"
                >
                  Add Ingredient
                </button>
              </div>
            )}
          </FieldArray>

          {/* Steps Section */}
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
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition duration-200 focus:outline-none"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => push("")}
                  className="flex items-center mt-2 text-blue-500 hover:text-blue-700 transition duration-200 focus:outline-none"
                >
                  Add Step
                </button>
              </div>
            )}
          </FieldArray>

          {/* Categories Section */}
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
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition duration-200 focus:outline-none"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => push("")}
                  className="flex items-center mt-2 text-blue-500 hover:text-blue-700 transition duration-200 focus:outline-none"
                >
                  Add Category
                </button>
              </div>
            )}
          </FieldArray>

          {/* Form Actions */}
          <div className="flex justify-between space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 focus:outline-none"
            >
              Create Recipe
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300 focus:outline-none"
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
