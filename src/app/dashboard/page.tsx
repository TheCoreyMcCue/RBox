"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import LoadingScreen from "../components/LoadingScreen";
import { getFollowerCount } from "@/lib/actions/user.action";
import { useEffect, useState } from "react";

import bg_dashboard from "../../../public/recipecards.png";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const userId = (session?.user as any)?._id;

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        const count = await getFollowerCount(userId);
        setFollowerCount(count);
      } catch (e) {
        console.error("Failed to load follower count", e);
        setFollowerCount(0);
      }
    };
    load();
  }, [userId]);

  if (status === "loading") {
    return <LoadingScreen message="loading your dashboard" />;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center text-center from-amber-50 via-amber-100 to-amber-50 bg-cover bg-center px-6">
        <h1 className="text-5xl font-[Homemade Apple] text-amber-800 drop-shadow mb-4">
          Welcome to Nana’s Cookbook
        </h1>
        <p className="text-amber-700 font-serif mb-8">
          Sign in to access your recipes and discover others 🍲
        </p>

        <button
          onClick={() => signIn("google")}
          className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-10 rounded-full text-lg font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  // ---------------- Inline SVG Icons ----------------

  const BookIcon = (
    <svg
      className="w-14 h-14 text-amber-700 group-hover:scale-110 transition"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 4.5h10.5a2.25 2.25 0 012.25 2.25v11.25a2.25 2.25 0 01-2.25 2.25H3.75V4.5zM3.75 4.5h-.75A1.5 1.5 0 001.5 6v12a1.5 1.5 0 001.5 1.5h.75"
      />
    </svg>
  );

  const StarIcon = (
    <svg
      className="w-14 h-14 text-amber-700 group-hover:scale-110 transition"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 .587l3.668 7.57L24 9.748l-6 5.848L19.335 24 12 19.897 4.665 24 6 15.596 0 9.748l8.332-1.591z" />
    </svg>
  );

  const UserPlusIcon = (
    <svg
      className="w-14 h-14 text-amber-700 group-hover:scale-110 transition"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5a3 3 0 110 6 3 3 0 010-6zm6 12v-1.125a4.875 4.875 0 00-9.75 0V16.5M19.5 8.25v3M21 9.75h-3"
      />
    </svg>
  );

  const UsersIcon = (
    <svg
      className="w-14 h-14 text-amber-700 group-hover:scale-110 transition"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m14-10a4 4 0 11-8 0 4 4 0 018 0zm6 10v-2a4 4 0 00-3-3.874M16 11a4 4 0 013-3.874"
      />
    </svg>
  );

  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      {/* Background Layer */}
      <div
        className="absolute inset-0 bg-fixed bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bg_dashboard.src})`,
          backgroundSize: "100% 100%",
          opacity: 0.11,
        }}
      />

      {/* Foreground Content */}
      <div className="relative z-10 px-4 py-14">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-[Homemade Apple] text-amber-800 drop-shadow-sm">
            Welcome Back, {session.user?.name?.split(" ")[0] || "Chef"} 👩‍🍳
          </h1>

          {followerCount !== null && (
            <p className="text-amber-700 font-serif mt-1">
              Followers: {followerCount}
            </p>
          )}

          <p className="text-amber-700 font-serif mt-2">
            Your cozy cooking home — explore, save, and share
          </p>
        </div>

        {/* Tile Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {/* My Cookbook */}
          <Link href="/my-cookbook">
            <div className="group bg-white/90 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center">
              {BookIcon}
              <h2 className="text-3xl font-[Homemade Apple] text-amber-800">
                My Cookbook
              </h2>
              <p className="text-amber-700 mt-2 font-serif">
                View and manage all your personal recipes
              </p>
            </div>
          </Link>

          {/* Saved Recipes */}
          <Link href="/saved">
            <div className="group bg-white/90 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center">
              {StarIcon}
              <h2 className="text-3xl font-[Homemade Apple] text-amber-800">
                Saved Recipes
              </h2>
              <p className="text-amber-700 mt-2 font-serif">
                Your favorites and recipes from others you saved
              </p>
            </div>
          </Link>

          {/* Discover People */}
          <Link href="/discover">
            <div className="group bg-white/90 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center">
              {UserPlusIcon}
              <h2 className="text-3xl font-[Homemade Apple] text-amber-800">
                Discover People
              </h2>
              <p className="text-amber-700 mt-2 font-serif">
                Find other cooks and explore their cookbook collections
              </p>
            </div>
          </Link>

          {/* Following */}
          <Link href="/following">
            <div className="group bg-white/90 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center">
              {UsersIcon}
              <h2 className="text-3xl font-[Homemade Apple] text-amber-800">
                Following
              </h2>
              <p className="text-amber-700 mt-2 font-serif">
                The cooks you follow — and their latest recipes
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
