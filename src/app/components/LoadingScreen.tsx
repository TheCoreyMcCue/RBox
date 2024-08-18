import React from "react";

const LoadingScreen = () => {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce"></div>
        <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce delay-150"></div>
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce delay-300"></div>
      </div>
      <span className="mt-4 text-gray-600 text-lg">Loading Recipes...</span>
    </div>
  );
};

export default LoadingScreen;
