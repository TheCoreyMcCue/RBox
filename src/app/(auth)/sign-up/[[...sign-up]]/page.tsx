import { SignUp } from "@clerk/nextjs";
import React from "react";

const signUpPage = () => {
  return (
    <main className="flex justify-center py-4 min-h-screen">
      <SignUp />
    </main>
  );
};

export default signUpPage;
