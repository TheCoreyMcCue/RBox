import { currentUser } from "@clerk/nextjs/server";
import { getRecipesByUser } from "@/lib/actions/recipe.action";

const Dashboard = async () => {
  const user = await currentUser();

  if (!user) {
    // Handle the case where the user is not authenticated
    return (
      <div className="min-h-[90vh]">
        <h1 className="text-2xl font-bold mb-4">
          Please sign in to view your recipes
        </h1>
      </div>
    );
  }

  const recipes = await getRecipesByUser(user.id);
  console.log(user.id, "recipes", recipes);

  return (
    <div className="min-h-[90vh]">
      <h1 className="text-2xl font-bold mb-4">Your Recipes</h1>
      {recipes.length > 0 ? (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe._id}>
              <h2 className="text-xl font-semibold">{recipe.title}</h2>
              <p>{recipe.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recipes found.</p>
      )}
    </div>
  );
};

export default Dashboard;
