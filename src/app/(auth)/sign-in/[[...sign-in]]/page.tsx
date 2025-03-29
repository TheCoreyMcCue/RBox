"use client";

import { signIn } from "next-auth/react";
import React from "react";

const SignInPage = () => {
  return (
    <main className="flex flex-col items-center justify-center py-8 min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Sign In</h1>
        <p className="text-gray-600 mb-4">
          Use your Google account to continue
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all"
        >
          Sign In with Google
        </button>
      </div>
    </main>
  );
};

export default SignInPage;
