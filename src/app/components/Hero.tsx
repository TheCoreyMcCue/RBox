"use client";

import Link from "next/link";
import heroImage from "../../../public/family-dinner.png";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

const Hero = () => {
  const { isSignedIn } = useUser(); // Correct way to destructure
  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* Background Image */}
      <Image
        src={heroImage}
        alt="Family Dinner"
        layout="fill"
        objectFit="cover"
        quality={80}
        className="absolute inset-0 z-0" // Use z-0 for background
        placeholder="blur" // Optional: if you want a blurred effect while loading
        priority // Optional: for preloading the hero image
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-30 z-10" />

      {/* Content */}
      <div className="relative z-20 flex items-center justify-center h-full">
        <div className="text-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Welcome to Our Box
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
            We help you pick what&apos;s for dinner tonight!
          </p>
          <Link href={isSignedIn ? "/recipes/create" : "/dashboard"}>
            <div className="inline-block bg-blue-500 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-blue-600 hover:scale-105 transition duration-300 cursor-pointer shadow-lg transform-gpu hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50">
              Get Started
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
