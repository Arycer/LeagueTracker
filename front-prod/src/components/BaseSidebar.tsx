import React from "react";

interface BaseSidebarProps {
    className?: string;
    children?: React.ReactNode;
}

export const BaseSidebar: React.FC<BaseSidebarProps> = ({ className = "", children }) => (
    <aside
        className={`w-64 min-h-screen bg-[#13101d] border-l border-[#2a1845] shadow-inner flex flex-col items-center pt-8 text-gray-100 ${className}`}
    >
        {children}
    </aside>
);
