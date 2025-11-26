// app/user/[id]/page.tsx
export const dynamic = "force-dynamic";

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

  // Logged-in user ID (string or null)
  const rawId =
    (session?.user as any)?._id || (session?.user as any)?.clerkId || null;
  const loggedInId = rawId ? String(rawId) : null;

  const profileUserId = String(params.id);

  // Fetch profile + recipes (SSR)
  const profileUser = await getUserProfile(profileUserId);
  const recipes = await getRecipesByUser(profileUserId);

  // If user not found
  if (!profileUser) {
    return (
      <UserProfileClient
        loggedInId={loggedInId}
        profileUser={null}
        initialRecipes={[]}
      />
    );
  }

  // Fully serialize Mongo docs → plain JSON
  const safeUser = JSON.parse(JSON.stringify(profileUser));
  const safeRecipes = JSON.parse(JSON.stringify(recipes || []));

  return (
    <UserProfileClient
      loggedInId={loggedInId}
      profileUser={safeUser}
      initialRecipes={safeRecipes}
    />
  );
}
