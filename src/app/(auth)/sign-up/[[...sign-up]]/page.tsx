import { SignUp } from "@clerk/nextjs";
import React from "react";

const signUpPage = () => {
  return (
    <main className="flex justify-center my-2">
      <SignUp />
    </main>
  );
};

export default signUpPage;
