"use client";
import FriendManager from "./FriendManager";
// Importaciones no utilizadas eliminadas

export default function FriendsPage() {
  return (
    <div className="relative w-full h-full flex items-start justify-center">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-[#232b3a]" />
      <div className="relative z-10 w-full flex flex-col items-center pt-8 pb-8 px-2 md:px-0">
        <FriendManager />
      </div>
    </div>
  );
}
