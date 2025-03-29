"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

import logo from "../../../public/dinnerlogo.png";
import AuthButtons from "../components/AuthButtons";

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
    <nav className="bg-light-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                <Image
                  src={logo}
                  alt="logo"
                  className="h-auto w-[2rem] rounded"
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8 ml-10">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Home
              </Link>
              {signedIn && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    My Dashboard
                  </Link>
                  <Link
                    href="/recipes/all"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Discover Recipes
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Auth Controls */}
          <div className="flex items-center">
            <AuthButtons />
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-200"
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
      </div>

      {isOpen && (
        <div ref={menuRef} className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            {signedIn && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                >
                  My Dashboard
                </Link>
                <Link
                  href="/recipes/all"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                >
                  Discover Recipes
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
