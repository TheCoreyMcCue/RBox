"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

const Hero = () => {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";

  return (
    <div className="relative w-full h-screen bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center flex items-center justify-center px-4">
      {/* Coffee ring + stains can be layered in with absolute positioned divs if needed */}

      <div className="bg-white/90 p-8 rounded-lg shadow-lg border border-dashed border-brown-300 max-w-2xl text-center backdrop-blur-sm">
        <h1 className="text-5xl font-handwritten text-brown-800 mb-4">
          Nana’s Notebook
        </h1>
        <p className="text-lg sm:text-xl text-brown-700 font-serif mb-8">
          A cozy place to keep your family recipes safe, just like grandma’s.
        </p>

        {isSignedIn ? (
          <Link href="/recipes/create">
            <div className="inline-block bg-yellow-700 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-yellow-800 transition duration-300 shadow-md">
              Add a Recipe
            </div>
          </Link>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="inline-block bg-yellow-700 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-yellow-800 transition duration-300 shadow-md"
          >
            Get Started
          </button>
        )}
      </div>
    </div>
  );
};

export default Hero;
