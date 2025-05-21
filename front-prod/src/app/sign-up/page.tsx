"use client";
import React from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      <div className="w-full max-w-md">
        <SignUp 
          redirectUrl="/"
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
