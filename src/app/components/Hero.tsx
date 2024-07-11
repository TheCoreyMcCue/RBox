"use client";

import Link from "next/link";
import heroImage from "../../../public/family-dinner.png";
import Image from "next/image";

import { useUser } from "@clerk/nextjs";

const Hero = () => {
  const user = useUser();
  const isSignedIn = user?.isSignedIn;

  return (
    <div className="bg-teal-600 text-white py-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Our Box
          </h1>
          <p className="text-lg md:text-xl mb-8">
            We help you pick whats for dinner tonight!
          </p>
          <Link href={isSignedIn ? "/recipes/create" : "/dashboard"}>
            <div className="inline-block bg-blue-500 text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-blue-600 transition duration-300 cursor-pointer">
              Get Started
            </div>
          </Link>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <Image src={heroImage} alt="Hero" className="rounded-lg shadow-lg" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
