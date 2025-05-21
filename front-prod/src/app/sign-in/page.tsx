"use client";
import React from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      <div className="w-full max-w-md">
        <SignIn 
          redirectUrl="/"
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
