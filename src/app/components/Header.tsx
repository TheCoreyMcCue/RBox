"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut, signIn } from "next-auth/react";
import AuthButtons from "../components/AuthButtons";
import logo from "../icon.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { data: session, status } = useSession();
  const signedIn = status === "authenticated";

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <header className="bg-amber-50/90 backdrop-blur-md border-b border-amber-200 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <Image src={logo} alt="logo" className="h-auto w-[3rem] rounded" />
            <span className="hidden sm:inline text-2xl font-[Homemade Apple] text-amber-800 tracking-wide">
              Nana&apos;s Cookbook
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center space-x-8 font-serif text-amber-800">
            {!signedIn && (
              <>
                <Link
                  href="/"
                  className="hover:text-amber-600 transition duration-200"
                >
                  Home
                </Link>
                <Link
                  href="/discover"
                  className="hover:text-amber-600 transition duration-200"
                >
                  Discover People
                </Link>
              </>
            )}

            {signedIn && (
              <>
                <Link
                  href="/dashboard"
                  className="hover:text-amber-600 transition duration-200"
                >
                  Dashboard
                </Link>

                <Link
                  href="/my-cookbook"
                  className="hover:text-amber-600 transition duration-200"
                >
                  My Cookbook
                </Link>

                <Link
                  href="/saved"
                  className="hover:text-amber-600 transition duration-200"
                >
                  Saved Recipes
                </Link>

                <Link
                  href="/following"
                  className="hover:text-amber-600 transition duration-200"
                >
                  Following
                </Link>

                <Link
                  href="/discover"
                  className="hover:text-amber-600 transition duration-200"
                >
                  Discover People
                </Link>
              </>
            )}
          </nav>

          {/* DESKTOP AUTH BUTTONS */}
          <div className="hidden md:flex items-center">
            <AuthButtons />
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-amber-800 hover:bg-amber-100 transition"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {isOpen && (
        <div
          ref={menuRef}
          className="md:hidden bg-white/95 backdrop-blur-md border-t border-amber-200 shadow-md"
        >
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-amber-100 rounded-md transition"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="px-4 pb-4 space-y-2 text-amber-800 font-serif">
            {!signedIn && (
              <>
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md hover:bg-amber-100"
                >
                  Home
                </Link>
                <Link
                  href="/discover"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md hover:bg-amber-100"
                >
                  Discover People
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signIn("google");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-amber-100"
                >
                  Sign In
                </button>
              </>
            )}

            {signedIn && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 hover:bg-amber-100"
                >
                  Dashboard
                </Link>

                <Link
                  href="/my-cookbook"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 hover:bg-amber-100"
                >
                  My Cookbook
                </Link>

                <Link
                  href="/saved"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 hover:bg-amber-100"
                >
                  Saved Recipes
                </Link>

                <Link
                  href="/following"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 hover:bg-amber-100"
                >
                  Following
                </Link>

                <Link
                  href="/discover"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 hover:bg-amber-100"
                >
                  Discover People
                </Link>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-amber-100"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
