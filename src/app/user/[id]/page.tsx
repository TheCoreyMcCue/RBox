"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getUserProfile } from "@/lib/actions/user.action";
import { getRecipesByUser } from "@/lib/actions/recipe.action";
import { followUser, unfollowUser } from "@/lib/actions/user.action";
import Image from "next/image";
import Link from "next/link";
import Placeholder from "../../../../public/placeholder.png";

export default function UserProfilePage() {
  const { id: profileUserId } = useParams();
  const { data: session } = useSession();

  const loggedInId =
    (session?.user as any)?._id || (session?.user as any)?.clerkId;

  const [user, setUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // ---------------- LOAD USER + RECIPES ----------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const userData = await getUserProfile(profileUserId as string);
      const recipeData = await getRecipesByUser(profileUserId as string);

      setUser(userData);
      setRecipes(recipeData);

      if (
        (userData as any)?.followers?.includes(loggedInId) &&
        loggedInId !== profileUserId
      ) {
        setIsFollowing(true);
      }

      setLoading(false);
    };

    load();
  }, [profileUserId, loggedInId]);

  // ---------------- FOLLOW / UNFOLLOW ----------------
  const handleFollow = async () => {
    if (!loggedInId) return;

    await followUser(loggedInId, profileUserId as string);
    setIsFollowing(true);

    setUser((prev: any) => ({
      ...prev,
      followers: [...(prev?.followers || []), loggedInId],
    }));
  };

  const handleUnfollow = async () => {
    if (!loggedInId) return;

    await unfollowUser(loggedInId, profileUserId as string);
    setIsFollowing(false);

    setUser((prev: any) => ({
      ...prev,
      followers: (prev?.followers || []).filter(
        (id: string) => id !== loggedInId
      ),
    }));
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-amber-700 font-serif">
        Loading profile...
      </div>
    );
  }

  // ---------------- NOT FOUND ----------------
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-center px-6">
        <h1 className="text-4xl font-[Homemade Apple] text-amber-800 mb-4">
          User not found
        </h1>
        <Link href="/discover" className="text-amber-700 underline font-serif">
          Go back to discover
        </Link>
      </div>
    );
  }

  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Unnamed Cook";

  return (
    <div className="min-h-[100vh] from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center px-6 py-12">
      <div className="max-w-4xl mx-auto bg-white/80 border border-amber-200 rounded-3xl shadow p-10 backdrop-blur-sm">
        {/* PROFILE HEADER */}
        <div className="flex flex-col items-center text-center mb-10">
          <Image
            src={user.photo || "/placeholder-user.png"}
            alt={fullName}
            width={110}
            height={110}
            className="rounded-full border border-amber-200 shadow-md"
          />

          <h1 className="text-4xl font-[Homemade Apple] text-amber-800 mt-4">
            {fullName}
          </h1>

          <p className="text-amber-700 font-serif mt-1">{user.email}</p>

          {/* FOLLOW BUTTON */}
          {loggedInId && loggedInId !== profileUserId && (
            <button
              onClick={isFollowing ? handleUnfollow : handleFollow}
              className={`mt-4 px-6 py-2 rounded-full text-white shadow font-serif transition ${
                isFollowing
                  ? "bg-amber-400 hover:bg-amber-500"
                  : "bg-amber-700 hover:bg-amber-800"
              }`}
            >
              {isFollowing ? "Following ✓" : "Follow +"}
            </button>
          )}

          {/* COUNTS */}
          <div className="flex gap-6 mt-6 text-amber-700 font-serif">
            <span>
              <strong>{user.followerCount}</strong> Followers
            </span>
            <span>
              <strong>{user.followingCount}</strong> Following
            </span>
          </div>
        </div>

        {/* THEIR COOKBOOK */}
        <h2 className="text-3xl font-[Homemade Apple] text-amber-800 mb-6">
          {fullName}&apos;s Cookbook 📖
        </h2>

        {recipes.length === 0 ? (
          <p className="text-amber-700 font-serif text-center">
            No recipes yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {recipes.map((recipe) => (
              <Link key={recipe._id} href={`/recipes/${recipe._id}`}>
                <div className="bg-white/90 border border-amber-200 rounded-2xl overflow-hidden shadow hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                  <Image
                    src={recipe.image || Placeholder}
                    alt={recipe.title}
                    width={500}
                    height={300}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-amber-800 line-clamp-1">
                      {recipe.title}
                    </h3>
                    <p className="text-amber-700/80 mt-1 line-clamp-2 font-serif">
                      {recipe.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
