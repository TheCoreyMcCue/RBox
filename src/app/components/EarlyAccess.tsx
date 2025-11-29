"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import bg_default from "../../../public/recipecards.png";

export default function EarlyAccessGate() {
  const { status } = useSession();
  const [shouldShow, setShouldShow] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  // Show gate only for non-authenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      setShouldShow(true);
    } else {
      setShouldShow(false);
    }
  }, [status]);

  const handleAccess = () => {
    if (!accessCode.trim()) {
      setCodeError("Please enter your early access code.");
      return;
    }
    // Always allow for now
    if (accessCode.trim() === "accessforlife") {
      setShouldShow(false);
      signIn("google");
      return null;
    }
  };

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover opacity-40"
          style={{ backgroundImage: `url(${bg_default.src})` }}
        />
      </div>

      {/* Soft overlay */}
      <div className="absolute inset-0 bg-amber-50/60 backdrop-blur-sm flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/90 border border-amber-300 rounded-3xl shadow-2xl p-8 text-center">
          <h1 className="text-4xl font-[Homemade Apple] text-amber-800 mb-4">
            Early Access ✨
          </h1>

          <p className="text-amber-700 font-serif mb-6 leading-relaxed">
            Enter your early access code to continue.
          </p>

          <input
            type="text"
            value={accessCode}
            onChange={(e) => {
              setAccessCode(e.target.value);
              if (codeError) setCodeError(null);
            }}
            placeholder="Enter access code"
            className="w-full border border-amber-300 rounded-full py-3 px-4 mb-2 text-lg"
          />
          {codeError && (
            <p className="text-red-600 text-sm mb-4">{codeError}</p>
          )}

          <button
            onClick={handleAccess}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-full text-lg font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
          >
            Enter
          </button>

          <button
            className="mt-4 text-amber-700 underline font-serif"
            onClick={() => signIn("google")}
          >
            I’m an existing user
          </button>
        </div>
      </div>
    </div>
  );
}
