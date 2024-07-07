import { currentUser } from "@clerk/nextjs/server";
import { getRecipesByUser } from "@/lib/actions/recipe.action";

const Dashboard = async () => {
  const user = await currentUser();
  const recipes = await getRecipesByUser(user.id);
  console.log(user?.id, "recipes", recipes);

  return <div className="min-h-[90vh]">user</div>;
};

export default Dashboard;
