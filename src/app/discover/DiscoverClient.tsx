// src/app/discover/DiscoverClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { followUser, unfollowUser } from "@/lib/actions/user.action";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface DiscoverClientProps {
  users: any[];
  bgImage: string;
}

export default function DiscoverClient({
  users,
  bgImage,
}: DiscoverClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const loggedInId =
    (session?.user as any)?._id || (session?.user as any)?.clerkId;

  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);

  // Ensure client has its own copy
  const [clientUsers] = useState<any[]>(users);

  // Filter users
  useEffect(() => {
    if (searchTerm.length < 2) {
      setFiltered([]);
      return;
    }

    const lower = searchTerm.toLowerCase();

    const results = clientUsers.filter((u) => {
      if (!u) return false;

      const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`
        .toLowerCase()
        .trim();

      return u.email?.toLowerCase().includes(lower) || fullName.includes(lower);
    });

    setFiltered(results);
  }, [searchTerm, clientUsers]);

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <h1 className="text-2xl">Sign in required</h1>
      </div>
    );
  }

  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="w-full h-full bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            opacity: 0.25,
          }}
        />
      </div>

      {/* Foreground */}
      <div className="relative z-10 px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-[Homemade Apple] text-amber-800">
            Discover People 👥
          </h1>
          <p className="font-serif text-amber-700 mt-2">
            Search for other cooks by name or email
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-10 relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-amber-300 shadow-sm bg-white/90 text-amber-800 placeholder:text-amber-400 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />

          <svg
            className="w-5 h-5 absolute left-4 top-3.5 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>

        {searchTerm.length > 0 && searchTerm.length < 2 && (
          <p className="text-center text-amber-700 font-serif mb-4">
            Type at least 2 characters to search…
          </p>
        )}

        {/* Results */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((user) => {
            const alreadyFollowing = user.followers?.includes(loggedInId);

            return (
              <div
                key={user._id}
                onClick={() => router.push(`/user/${user._id}`)}
                className="group bg-white/90 border border-amber-200 rounded-3xl p-6 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer backdrop-blur-sm text-center"
              >
                <div className="flex justify-center mb-4">
                  <Image
                    src={user.photo || "/placeholder-user.png"}
                    alt="User Photo"
                    width={90}
                    height={90}
                    className="rounded-full border border-amber-200 shadow-sm group-hover:scale-105 transition"
                  />
                </div>

                <h2 className="text-xl font-[Homemade Apple] text-amber-800">
                  {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                    "Unnamed Cook"}
                </h2>

                <p className="text-amber-700 text-sm font-serif mt-1">
                  {user.email}
                </p>

                <p className="text-amber-600 font-serif text-sm mt-3">
                  followers: {user.followers?.length ?? 0}
                </p>

                {user._id !== loggedInId && (
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();

                      if (alreadyFollowing) {
                        await unfollowUser(loggedInId, user._id);

                        setFiltered((prev) =>
                          prev.map((u) =>
                            u._id === user._id
                              ? {
                                  ...u,
                                  followers: (u.followers ?? []).filter(
                                    (fid: string) => fid !== loggedInId
                                  ),
                                }
                              : u
                          )
                        );
                      } else {
                        await followUser(loggedInId, user._id);

                        setFiltered((prev) =>
                          prev.map((u) =>
                            u._id === user._id
                              ? {
                                  ...u,
                                  followers: [
                                    ...(u.followers ?? []),
                                    loggedInId,
                                  ],
                                }
                              : u
                          )
                        );
                      }
                    }}
                    className={`mt-4 w-full py-2 rounded-full font-serif shadow transition ${
                      alreadyFollowing
                        ? "bg-amber-400 hover:bg-amber-500 text-white"
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                  >
                    {alreadyFollowing ? "Following ✓" : "Follow"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {searchTerm.length >= 2 && filtered.length === 0 && (
          <p className="text-center text-amber-700 font-serif mt-10">
            No users found matching “{searchTerm}”
          </p>
        )}
      </div>
    </div>
  );
}
