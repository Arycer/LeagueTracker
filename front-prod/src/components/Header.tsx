"use client";
import React from "react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./Button";
import { useUserContext } from "../context/UserContext";

export const Header: React.FC = () => {
  const { username } = useUserContext();
  return (
    <header className="bg-gradient-to-r from-[#232946] to-[#393e6e] border-b border-[#232946]/40 shadow-md h-20 grid grid-cols-[1fr_auto_1fr] items-center px-8">
      <div className="justify-self-start">
        <SignedIn>
          <nav className="flex gap-4 items-center">
            <Link
              href="/friends"
              className="text-blue-200 hover:text-white font-medium transition-colors"
            >
              Amigos
            </Link>
            <Link
              href="/linked-accounts"
              className="text-blue-200 hover:text-white font-medium transition-colors"
            >
              Perfiles vinculados
            </Link>
          </nav>
        </SignedIn>
      </div>
      <Link
        href="/"
        className="text-3xl font-extrabold tracking-tight select-none text-center cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          fontFamily:
            'var(--font-inter, "Inter", Arial, Helvetica, sans-serif)',
        }}
        aria-label="Ir a inicio"
      >
        <span className="text-sky-400">League</span>
        <span className="text-white">Tracker</span>
      </Link>
      <div className="flex items-center gap-3 justify-self-end">
        <SignedOut>
          <SignInButton>
            <Button
              variant="outline"
              className="border-blue-200 text-blue-200 hover:bg-blue-200 hover:text-[#232946]"
            >
              Iniciar sesión
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button
              variant="primary"
              className="bg-blue-500 text-white hover:bg-blue-400"
            >
              Registrarse
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          {username && (
            <span className="text-blue-200 font-medium text-base mr-1">
              {username}
            </span>
          )}
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "ring-2 ring-blue-200 w-10 h-10 min-w-10 min-h-10",
                userButtonAvatar: "w-10 h-10 min-w-10 min-h-10",
              },
            }}
          />
        </SignedIn>
      </div>
    </header>
  );
};
