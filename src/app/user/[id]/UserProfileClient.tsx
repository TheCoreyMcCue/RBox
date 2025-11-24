"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Placeholder from "../../../../public/placeholder.png";
import bg_profile from "../../../../public/recipecards.png";

import {
  followUser,
  unfollowUser,
  saveRecipe,
  unsaveRecipe,
  getSavedRecipes,
} from "@/lib/actions/user.action";

interface UserProfileClientProps {
  loggedInId: string | null;
  profileUser: any;
  initialRecipes: any[];
}

export default function UserProfileClient({
  loggedInId,
  profileUser,
  initialRecipes,
}: UserProfileClientProps) {
  const router = useRouter();

  const [user, setUser] = useState<any>(profileUser);
  const [recipes, setRecipes] = useState<any[]>(initialRecipes);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // ---------------- FOLLOW STATE ----------------
  useEffect(() => {
    if (!loggedInId || !user) return;
    if (user.followers?.includes(loggedInId) && loggedInId !== user._id) {
      setIsFollowing(true);
    }
  }, [loggedInId, user]);

  // ---------------- LOAD SAVED RECIPES ----------------
  useEffect(() => {
    const loadSaved = async () => {
      if (!loggedInId) return;
      const ids = await getSavedRecipes(loggedInId);
      setSavedIds(Array.isArray(ids) ? ids : []);
    };
    loadSaved();
  }, [loggedInId]);

  // ---------------- FOLLOW / UNFOLLOW ----------------
  const handleFollow = async () => {
    if (!loggedInId) return;
    await followUser(loggedInId, user._id);

    setIsFollowing(true);
    setUser((prev: any) => ({
      ...prev,
      followers: [...(prev.followers || []), loggedInId],
    }));
  };

  const handleUnfollow = async () => {
    if (!loggedInId) return;
    await unfollowUser(loggedInId, user._id);

    setIsFollowing(false);
    setUser((prev: any) => ({
      ...prev,
      followers: (prev.followers || []).filter(
        (id: string) => id !== loggedInId
      ),
    }));
  };

  // ---------------- FILTER RECIPES ----------------
  const filteredRecipes = recipes.filter((r: any) => {
    const t = searchTerm.toLowerCase();

    const matchText =
      r.title.toLowerCase().includes(t) ||
      r.description.toLowerCase().includes(t) ||
      r.categories?.some((c: string) => c.toLowerCase().includes(t));

    const matchCat = !activeCategory || r.categories?.includes(activeCategory);

    return matchText && matchCat;
  });

  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Unnamed Cook";

  // ---------------- BACK BUTTON LOGIC ----------------
  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/discover");
  };

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

  // -----------------------------------------------------
  // ------------------------- UI -------------------------
  // -----------------------------------------------------

  return (
    <div className="relative min-h-[100vh] overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div
          className="w-full h-full bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bg_profile.src})`,
            backgroundSize: "cover",
            opacity: 0.2,
          }}
        />
      </div>
      <div className="relative z-10 px-6 py-12 min-h-[100vh]">
        {/* 🔙 BACK */}
        <button
          onClick={handleBack}
          className="absolute left-6 top-6 bg-white/80 border border-amber-300 text-amber-800 px-4 py-2 rounded-full shadow hover:bg-white transition font-serif flex items-center gap-2 backdrop-blur-sm z-20"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* PROFILE CARD */}
        <div className="max-w-4xl mx-auto bg-white/80 border border-amber-200 rounded-3xl shadow p-10 backdrop-blur-sm mt-16">
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
            {loggedInId && loggedInId !== user._id && (
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

          {/* COOKBOOK */}
          <h2 className="text-3xl font-[Homemade Apple] text-amber-800 mb-6">
            {fullName}&apos;s Cookbook 📖
          </h2>

          {/* SEARCH */}
          <div className="max-w-xl mx-auto mb-8">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recipes..."
              className="w-full px-4 py-2 border rounded-full bg-white/80"
            />
          </div>

          {/* CATEGORY FILTER */}
          <div className="flex gap-2 flex-wrap justify-center mb-6">
            {[
              "breakfast",
              "lunch",
              "dinner",
              "dessert",
              "vegan",
              "vegetarian",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                className={`px-3 py-1 rounded-full border ${
                  activeCategory === cat
                    ? "bg-amber-700 text-white"
                    : "bg-white/70 text-amber-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* RECIPE GRID */}
          {filteredRecipes.length === 0 ? (
            <p className="text-amber-700 font-serif text-center">
              No recipes yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {filteredRecipes.map((recipe) => (
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

                      {loggedInId && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            if (savedIds.includes(recipe._id)) {
                              await unsaveRecipe(loggedInId, recipe._id);
                              setSavedIds((prev) =>
                                prev.filter((id) => id !== recipe._id)
                              );
                            } else {
                              await saveRecipe(loggedInId, recipe._id);
                              setSavedIds((prev) => [...prev, recipe._id]);
                            }
                          }}
                          className={`mt-3 w-full py-2 rounded-full text-white ${
                            savedIds.includes(recipe._id)
                              ? "bg-amber-400"
                              : "bg-amber-700 hover:bg-amber-800"
                          }`}
                        >
                          {savedIds.includes(recipe._id) ? "Saved ✓" : "Save +"}
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
