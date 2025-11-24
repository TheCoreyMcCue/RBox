// app/user/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProfile } from "@/lib/actions/user.action";
import { getRecipesByUser } from "@/lib/actions/recipe.action";
import UserProfileClient from "./UserProfileClient";

export default async function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  // SSR guard – user must be signed in
  const rawId =
    (session?.user as any)?._id || (session?.user as any)?.clerkId || null;
  const loggedInId = rawId ? String(rawId) : null;

  const profileUserId = params.id;

  // Fetch user + recipes on server
  const user = await getUserProfile(profileUserId);
  const recipes = await getRecipesByUser(profileUserId);

  // Convert Mongo objects → plain JSON
  const safeUser = user ? JSON.parse(JSON.stringify(user)) : null;
  const safeRecipes = JSON.parse(JSON.stringify(recipes || []));

  return (
    <UserProfileClient
      loggedInId={loggedInId}
      profileUser={safeUser}
      initialRecipes={safeRecipes}
    />
  );
}
