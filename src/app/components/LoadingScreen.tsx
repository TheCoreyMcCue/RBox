"use client";

import React from "react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading…",
}) => {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center from-amber-50 via-amber-100 to-amber-50 bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center px-4">
      {/* Animated Dots */}
      <div className="flex items-center justify-center space-x-3 mb-6">
        <div className="w-4 h-4 bg-amber-600 rounded-full animate-bounce"></div>
        <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce delay-150"></div>
        <div className="w-4 h-4 bg-amber-400 rounded-full animate-bounce delay-300"></div>
      </div>

      {/* Dynamic Message */}
      <p className="text-amber-800 text-xl font-serif drop-shadow-sm">
        {message}
      </p>
    </div>
  );
};

export default LoadingScreen;
