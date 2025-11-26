// app/dashboard/page.tsx (SERVER COMPONENT)

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFollowerCount } from "@/lib/actions/user.action";
import DashboardClient from "./DashboardClient";

import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // If not logged in, show simple gate (server-rendered)
  if (!session?.user) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl font-[Homemade Apple] text-amber-800 mb-4">
          Welcome to Nana’s Cookbook
        </h1>
        <p className="text-amber-700 font-serif mb-6">
          Sign in to access your recipes and discover others 🍲
        </p>
        <a
          href="/api/auth/signin"
          className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-10 rounded-full text-lg font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
        >
          Sign In with Google
        </a>
      </div>
    );
  }

  const userId = (session.user as any)?._id;
  if (!userId) redirect("/");

  // Fetch follower count on the server
  const followerCount = await getFollowerCount(userId);

  return (
    <DashboardClient
      userName={session.user.name ?? "Chef"}
      followerCount={followerCount ?? 0}
    />
  );
}
