"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getAllUsers } from "@/lib/actions/user.action";
import Link from "next/link";
import Image from "next/image";

export default function DiscoverPeoplePage() {
  const { data: session, status } = useSession();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(Array.isArray(users) ? users : [users]);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setFiltered([]);
      return;
    }

    const lower = searchTerm.toLowerCase();

    const results = allUsers.filter((u) => {
      if (!u) return false;

      const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`
        .toLowerCase()
        .trim();

      return u.email?.toLowerCase().includes(lower) || fullName.includes(lower);
    });

    setFiltered(results);
  }, [searchTerm, allUsers]);

  const loading = status === "loading";

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-amber-700 font-serif">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-[Homemade Apple] text-amber-800 mb-4">
          You must be signed in to discover people
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-[Homemade Apple] text-amber-800 drop-shadow">
          Discover People 👥
        </h1>
        <p className="font-serif text-amber-700 mt-2">
          Search for other cooks by name or email
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-10 relative">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full border border-amber-300 shadow-sm bg-white/90 text-amber-800 placeholder:text-amber-400 focus:ring-2 focus:ring-amber-400 focus:outline-none"
        />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 absolute left-4 top-3.5 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </div>

      {searchTerm.length > 0 && searchTerm.length < 2 && (
        <p className="text-center text-amber-700 font-serif mb-4">
          Type at least 2 characters to search…
        </p>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((user) => (
          <Link key={user._id} href={`/user/${user._id}`} className="group">
            <div className="bg-white/90 border border-amber-200 rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center backdrop-blur-sm">
              <div className="flex justify-center mb-4">
                <Image
                  src={user.photo || "/placeholder-user.png"}
                  alt={`${user.firstName ?? ""} ${user.lastName ?? ""}`}
                  width={90}
                  height={90}
                  className="rounded-full border border-amber-200 shadow-sm group-hover:scale-105 transition"
                />
              </div>

              <h2 className="text-xl font-[Homemade Apple] text-amber-800">
                {user.firstName || user.lastName
                  ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                  : "Unnamed Cook"}
              </h2>

              <p className="text-amber-700 text-sm font-serif mt-1">
                {user.email}
              </p>

              <p className="text-amber-600 font-serif text-sm mt-3">
                followers: {user.followers?.length ?? 0}
              </p>

              <button
                className="mt-4 w-full bg-amber-600 text-white py-2 rounded-full font-serif shadow hover:bg-amber-700 transition"
                type="button"
              >
                Follow
              </button>
            </div>
          </Link>
        ))}
      </div>

      {searchTerm.length >= 2 && filtered.length === 0 && (
        <p className="text-center text-amber-700 font-serif mt-10">
          No users found matching &quot;{searchTerm}&quot;
        </p>
      )}
    </div>
  );
}
