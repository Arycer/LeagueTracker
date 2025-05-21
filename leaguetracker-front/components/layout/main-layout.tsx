import React from 'react';
import Header from './header';
import LeftSidebar from './left-sidebar';
import RightSidebar from './right-sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main className={`flex-1 overflow-y-auto p-0`}>
          {children}
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default MainLayout;
