"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import placeholderAvatar from "../../../public/placeholder-avatar.png";

export default function AuthButtons() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") return null;

  // 🔸 SIGN IN BUTTON
  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="text-base font-semibold font-serif px-5 py-2 rounded-full text-white bg-amber-700 hover:bg-amber-800 shadow-sm hover:shadow-md transition duration-300"
      >
        Sign In
      </button>
    );
  }

  // 🔸 WHEN SIGNED IN
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-100 hover:bg-amber-200 transition duration-300 border border-amber-300"
      >
        <Image
          src={session.user?.image || placeholderAvatar}
          alt="User avatar"
          width={32}
          height={32}
          className="rounded-full border border-amber-200"
        />

        {/* Show name on desktop */}
        <span className="hidden md:inline text-sm text-amber-800 font-serif">
          {session.user?.name?.split(" ")[0] || session.user?.email}
        </span>

        {/* Show name on mobile when dropdown opens */}
        {isDropdownOpen && (
          <span className="md:hidden text-sm text-amber-800 font-serif">
            {session.user?.name?.split(" ")[0] || session.user?.email}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm border border-amber-200 rounded-lg shadow-md z-50">
          <div className="px-4 py-3 border-b border-amber-100 text-amber-800 text-sm font-serif">
            Signed in as
            <br />
            <span className="font-medium">{session.user?.email}</span>
          </div>

          <button
            onClick={() => signOut()}
            className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition duration-200 font-serif"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
