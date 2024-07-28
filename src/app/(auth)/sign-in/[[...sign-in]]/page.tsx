import { SignIn } from "@clerk/nextjs";
import React from "react";

const signInPage = () => {
  return (
    <main className="flex justify-center py-8 min-h-screen">
      <SignIn />
    </main>
  );
};

export default signInPage;
