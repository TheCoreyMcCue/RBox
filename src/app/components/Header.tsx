"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut, signIn } from "next-auth/react";
import AuthButtons from "../components/AuthButtons";
import logo from "../icon.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();
  const signedIn = status === "authenticated";

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-amber-50/90 backdrop-blur-md border-b border-amber-200 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={logo}
                alt="logo"
                className="h-auto w-[3rem] rounded"
              />
              <span className="hidden sm:inline text-2xl font-[Homemade Apple] text-amber-800 tracking-wide">
                Nana’s Cookbook
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-8 font-serif text-amber-800">
            <Link
              href="/"
              className="hover:text-amber-600 transition-colors duration-200"
            >
              Home
            </Link>
            {signedIn && (
              <>
                <Link
                  href="/dashboard"
                  className="hover:text-amber-600 transition-colors duration-200"
                >
                  My Dashboard
                </Link>
                <Link
                  href="/recipes/all"
                  className="hover:text-amber-600 transition-colors duration-200"
                >
                  Discover Recipes
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center">
            <AuthButtons />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-amber-800 hover:text-amber-900 hover:bg-amber-100 transition"
          >
            <svg
              className="h-6 w-6"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div
          ref={menuRef}
          className="md:hidden bg-white/95 backdrop-blur-md border-t border-amber-200 shadow-md"
        >
          <div className="px-4 py-4 space-y-2 text-amber-800 font-serif">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md hover:bg-amber-100 transition"
            >
              Home
            </Link>

            {signedIn && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md hover:bg-amber-100 transition"
                >
                  My Dashboard
                </Link>

                <Link
                  href="/recipes/all"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md hover:bg-amber-100 transition"
                >
                  Discover Recipes
                </Link>

                {/* 🔥 SIGN OUT BUTTON FOR MOBILE */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-amber-100 transition text-red-600 font-medium"
                >
                  Sign Out
                </button>
              </>
            )}

            {!signedIn && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  signIn("google");
                }}
                className="block w-full text-left px-3 py-2 rounded-md hover:bg-amber-100 transition text-amber-800"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
