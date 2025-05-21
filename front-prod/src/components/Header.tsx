"use client";
import React from "react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useUserContext } from "../context/UserContext";

export const Header: React.FC = () => {
  const { username } = useUserContext();
  return (
    <header className="bg-[#13101d] border-b border-[#2a1845] shadow-md h-20 grid grid-cols-[1fr_auto_1fr] items-center px-8">
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
      <div className="flex items-center gap-4 justify-self-end">
        <SignedOut>
          <Link href="/sign-in" className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-md blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
            <button className="relative px-5 py-2 bg-[#1e293b] rounded-md text-blue-300 font-medium border border-blue-500/30 group-hover:text-blue-100 transition-all duration-200">
              Iniciar sesión
            </button>
          </Link>
          <Link href="/sign-up" className="relative">
            <button className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-md text-white font-semibold shadow-lg hover:shadow-blue-500/20 hover:from-blue-500 hover:to-blue-400 transition-all duration-300">
              Registrarse
            </button>
          </Link>
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
