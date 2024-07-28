"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { getRecipeById, deleteRecipe } from "@/lib/actions/recipe.action";
import EditModal from "@/app/components/EditModal";
import DeleteModal from "@/app/components/DeleteModal";
import Image from "next/image";

import Placeholder from "../../../../public/placeholder.png";

interface Ingredient {
  amount: string;
  unit: string;
  name: string;
}

interface Recipe {
  _id: string;
  title: string;
  creator: string;
  description: string;
  image: string;
  cookTime: string;
  ingredients: Ingredient[];
  steps: string[];
  category: string[];
}

const RecipeDetails = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [id, setId] = useState(pathname.split("/")[2]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (id) {
        try {
          const fetchedRecipe = await getRecipeById(id as string);
          if (!fetchedRecipe) {
            router.push("/404"); // Redirect to 404 page if recipe not found
          } else {
            setRecipe(fetchedRecipe);
          }
        } catch (error) {
          console.error("Error fetching recipe:", error);
          router.push("/404");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRecipe();
  }, [id, router]);

  const openEditModal = () => {
    setShowEditModal(true);
  };
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (recipe) {
      try {
        await deleteRecipe(recipe._id, recipe.creator);
        router.push("/dashboard"); // Navigate back to the dashboard after deletion
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center">
        <h1 className="text-2xl font-bold">Recipe not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">{recipe.title}</h1>
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <Image
          src={recipe.image || Placeholder}
          alt={recipe.title}
          height={1200}
          width={1200}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <p className="text-gray-700 mb-4">{recipe.description}</p>
          <p className="text-gray-500 mb-4">
            Cook Time: {recipe.cookTime} minutes
          </p>
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="list-disc list-inside mb-4">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.amount} {ingredient.unit} - {ingredient.name}
              </li>
            ))}
          </ul>
          <h2 className="text-2xl font-semibold mb-4">Steps</h2>
          <ol className="list-decimal list-inside mb-4">
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <h5 className="text-md font-semibold mb-1">Categories</h5>
          <ul className="list-disc list-inside mb-4">
            {recipe.category.map((category, index) => (
              <li key={index} className="text-gray-500">
                {category}
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-green-500 text-white px-2 py-2 rounded-lg  hover:bg-blue-600"
            >
              ⬅️ Back
            </button>
            <div className="flex space-x-2">
              <button
                onClick={openEditModal}
                className="bg-blue-500 text-white px-2 py-2 rounded-lg hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={openDeleteModal}
                className="bg-red-500 text-white px-2 py-2 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      {showEditModal && <EditModal recipe={recipe} onClose={closeEditModal} />}
      {showDeleteModal && (
        <DeleteModal handleDelete={handleDelete} onClose={closeDeleteModal} />
      )}
    </div>
  );
};

export default RecipeDetails;
