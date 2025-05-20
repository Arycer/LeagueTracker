import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/theme.css";
import { UserProvider } from "../context/UserContext";
import { RightSidebar } from "@/components/RightSidebar";
import { LeftSidebar } from "@/components/LeftSidebar";
import { Header } from "@/components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeagueTracker",
  description: "Trackea tus partidas de League of Legends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <UserProvider>
        <html lang="es">
          <body className={`${inter.variable} antialiased`}>
            <div className="w-screen h-screen overflow-hidden">
              {/* HEADER FIJO */}
              <header className="fixed top-0 left-0 w-full h-20 z-50">
                <Header />
              </header>

              {/* CONTENIDO PRINCIPAL */}
              <div className="flex h-full w-full pt-20">
                <aside className="w-64 h-full">
                  <LeftSidebar />
                </aside>
                <main className="flex-1 h-full overflow-y-auto">
                  <div className="w-full h-full">{children}</div>
                </main>
                <aside className="w-64 h-full">
                  <RightSidebar />
                </aside>
              </div>
            </div>
          </body>
        </html>
      </UserProvider>
    </ClerkProvider>
  );
}
