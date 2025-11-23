import Image from "next/image";
import Link from "next/link";
import { getUserProfile, getAllUsers } from "@/lib/actions/user.action";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function FollowingPage() {
  // 1️⃣ Get session on the server
  const session = await getServerSession(authOptions);

  const userId = (session?.user as any)?._id || (session?.user as any)?.clerkId;

  if (!userId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-[Homemade Apple] text-amber-800 mb-4">
          Please sign in to view your following list
        </h1>
        <Link href="/" className="text-amber-700 underline font-serif">
          Go Home
        </Link>
      </div>
    );
  }

  // 2️⃣ Fetch user + following list
  const profile = await getUserProfile(userId);
  const following: string[] = profile?.following ?? [];

  // 3️⃣ Fetch all users
  const allUsers = await getAllUsers();
  const followingUsers = allUsers.filter((u: any) =>
    following.includes(u._id.toString())
  );

  return (
    <div className="min-h-[90vh] from-amber-50 via-amber-100 to-amber-50 bg-cover bg-center px-6 py-12">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-[Homemade Apple] text-amber-800 drop-shadow">
          People You Follow 👥
        </h1>
        <p className="font-serif text-amber-700 mt-2">
          All the cooks whose recipes inspire you
        </p>
      </div>

      {/* EMPTY STATE */}
      {followingUsers.length === 0 ? (
        <div className="text-center text-amber-700 font-serif mt-16">
          <p className="text-xl">You are not following anyone yet.</p>
          <Link
            href="/discover"
            className="underline text-amber-800 text-lg block mt-4"
          >
            Discover cooks
          </Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {followingUsers.map((user) => {
            const fullName =
              `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
              "Unnamed Cook";

            return (
              <Link key={user._id} href={`/user/${user._id}`} className="group">
                <div className="bg-white/90 border border-amber-200 rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center backdrop-blur-sm">
                  <div className="flex justify-center mb-4">
                    <Image
                      src={user.photo || "/placeholder-user.png"}
                      alt={fullName}
                      width={90}
                      height={90}
                      className="rounded-full border border-amber-200 shadow-sm group-hover:scale-105 transition"
                    />
                  </div>

                  <h2 className="text-xl font-[Homemade Apple] text-amber-800">
                    {fullName}
                  </h2>

                  <p className="text-amber-700 text-sm font-serif mt-1">
                    {user.email}
                  </p>

                  <p className="text-amber-600 font-serif text-sm mt-3">
                    Followers: {user.followers?.length ?? 0}
                  </p>

                  <button
                    className="mt-4 w-full bg-amber-600 text-white py-2 rounded-full font-serif shadow hover:bg-amber-700 transition"
                    type="button"
                  >
                    View Profile →
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
