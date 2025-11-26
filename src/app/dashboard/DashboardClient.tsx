"use client";

import Link from "next/link";
import bg_dashboard from "../../../public/recipecards.png";

interface DashboardClientProps {
  userName: string;
  followerCount: number;
}

export default function DashboardClient({
  userName,
  followerCount,
}: DashboardClientProps) {
  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="w-full h-full bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bg_dashboard.src})`,
            backgroundSize: "cover",
            opacity: 0.15,
          }}
        />
      </div>

      {/* Foreground */}
      <div className="relative z-10 px-4 py-14">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-[Homemade Apple] text-amber-800 drop-shadow-sm">
            Welcome Back, {userName} 👩‍🍳
          </h1>

          <p className="text-amber-700 font-serif mt-1">
            Followers: {followerCount}
          </p>

          <p className="text-amber-700 font-serif mt-2">
            Your cozy cooking home — explore, save, and share
          </p>
        </div>

        {/* Tile Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {/* My Cookbook */}
          <Link href="/my-cookbook">
            <div className="group bg-white/90 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition cursor-pointer flex flex-col items-center text-center">
              📖
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
            <div className="group bg-white/90 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition cursor-pointer flex flex-col items-center text-center">
              ⭐
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
            <div className="group bg-white/90 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition cursor-pointer flex flex-col items-center text-center">
              ➕
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
            <div className="group bg-white/90 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition cursor-pointer flex flex-col items-center text-center">
              👥
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
