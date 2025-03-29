"use client";

import { signIn } from "next-auth/react";

const NotSigned = () => {
  return (
    <div className="bg-gradient-to-br from-red-500 via-white-500 to-blue-600 min-h-[90vh] text-white flex flex-col items-center justify-center">
      <div className="text-center max-w-xl p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-2xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-orange-500">
          Welcome to Recipe Nest!
        </h1>
        <p className="text-lg md:text-xl mb-6 font-light">
          Sign in to discover and manage your favorite recipes effortlessly.
        </p>
        <button
          onClick={() => signIn("google")}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-10 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default NotSigned;
