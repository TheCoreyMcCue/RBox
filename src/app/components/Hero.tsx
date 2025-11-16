"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import logo from "../icon.png"; // Replace with the correct path to your new logo file

const Hero = () => {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";

  return (
    <div className="relative w-full min-h-dvh flex items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50 to-amber-100">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('/textures/notebook-paper.jpg')] opacity-50 bg-cover bg-center" />

      {/* Decorative overlays */}
      <div className="absolute top-8 left-6 w-24 h-24 bg-[url('/textures/coffee-ring.png')] bg-contain bg-no-repeat opacity-30 rotate-12 sm:w-32 sm:h-32" />
      <div className="absolute bottom-8 right-6 w-28 h-28 bg-[url('/textures/coffee-stain.png')] bg-contain bg-no-repeat opacity-25 -rotate-6 sm:w-40 sm:h-40" />

      {/* Main content box */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md border border-amber-200 rounded-2xl shadow-2xl w-[90%] max-w-2xl p-5 sm:p-10 text-center transform transition duration-500 hover:scale-[1.02]">
        <div className="flex justify-center mb-5">
          <Image
            src={logo}
            alt="Nana's Cookbook Logo"
            width={190}
            height={190}
            priority
            className="rounded-md" // removed shadow-md
          />
        </div>

        <p className="text-base sm:text-lg md:text-xl text-amber-700 font-serif mb-6 sm:mb-8 leading-relaxed">
          A cozy digital recipe box that feels like home. Keep your family
          favorites safe, organized, and ready to share — just like the one
          Grandma used to open on Sunday mornings.
        </p>

        {isSignedIn ? (
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link href="/dashboard">
              <div className="inline-block bg-amber-700 text-white py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold hover:bg-amber-800 transition duration-300 shadow-md">
                View Recipes
              </div>
            </Link>
            <Link href="/recipes/create">
              <div className="inline-block bg-amber-600 text-white py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold hover:bg-amber-700 transition duration-300 shadow-md">
                Add New Recipe
              </div>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={() => signIn("google")}
              className="inline-block bg-amber-700 text-white py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold hover:bg-amber-800 transition duration-300 shadow-md"
            >
              Get Started
            </button>
            <Link href="/#about">
              <div className="inline-block bg-white border border-amber-400 text-amber-800 py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold hover:bg-amber-50 transition duration-300 shadow-md">
                Learn More
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Floating recipe cards */}
      <div className="absolute hidden sm:block top-[12%] left-[4%] transform rotate-[-8deg] opacity-80">
        <Image
          src="https://marketplace.canva.com/EAGBuMS-5fM/3/0/1600w/canva-beige-white-retro-minimalist-recipe-card-FI7idgE80p8.jpg"
          alt="Recipe card 1"
          width={140}
          height={100}
          className="rounded-md shadow-md"
        />
      </div>
      <div className="absolute hidden sm:block bottom-[12%] right-[4%] transform rotate-[10deg] opacity-80">
        <Image
          src="https://marketplace.canva.com/EAGBuMS-5fM/3/0/1600w/canva-beige-white-retro-minimalist-recipe-card-FI7idgE80p8.jpg"
          alt="Recipe card 2"
          width={150}
          height={110}
          className="rounded-md shadow-md"
        />
      </div>
    </div>
  );
};

export default Hero;
