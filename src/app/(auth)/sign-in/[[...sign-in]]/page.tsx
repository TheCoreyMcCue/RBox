import { SignIn } from "@clerk/nextjs";
import React from "react";

const signInPage = () => {
  return (
    <main className="flex justify-center my-2">
      <SignIn />
    </main>
  );
};

export default signInPage;
