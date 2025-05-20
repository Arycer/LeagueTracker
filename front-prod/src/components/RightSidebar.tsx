import React from "react";
import { BaseSidebar } from "./BaseSidebar";
import Link from "next/link";

interface SidebarProps {
  className?: string;
}

export const RightSidebar: React.FC<SidebarProps> = ({ className = "" }) => (
  <BaseSidebar className={className}>
    <Link href="/friends" className="text-blue-200 font-bold text-lg mb-4">
      Amigos
    </Link>
    <div className="text-gray-300 text-sm">0 conectados</div>
  </BaseSidebar>
);
