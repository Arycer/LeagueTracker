import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/main-layout";
import {ClerkProvider} from "@clerk/nextjs";
import {DDragonProvider} from "../contexts/DDragonContext";
import {WebSocketProvider} from "../contexts/WebSocketContext";
import {UserProvider} from "../contexts/UserContext";
import {FriendsProvider} from "../contexts/FriendsContext";
import {ChatProvider} from "../contexts/ChatContext";
import {FavoriteProfilesProvider} from "../contexts/FavoriteProfilesContext";
import {LinkedAccountsProvider} from "../contexts/LinkedAccountsContext";
import {ModalProvider} from "@/contexts/ModalContext";
import Modal from "@/components/ui/modal";
import {Toaster} from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeagueTracker - Estadísticas de League of Legends",
  description:
    "Información acerca de tus partidas de League of Legends y las de tus amigos y oponentes en un solo lugar.",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
    <ClerkProvider>
      <UserProvider>
        <DDragonProvider>
          <WebSocketProvider>
            <FriendsProvider>
              <ModalProvider>
                <ChatProvider>
                  <FavoriteProfilesProvider>
                    <LinkedAccountsProvider>
                      <ModalProvider>
                        <MainLayout>{children}</MainLayout>
                        <Modal/>
                      </ModalProvider>
                    </LinkedAccountsProvider>
                  </FavoriteProfilesProvider>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      style: {
                        background: "#0f172a",
                        color: "#ffffff",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        fontWeight: "500",
                      },
                      className: "dark-toast",
                      descriptionClassName: "text-white",
                    }}
                  />
                </ChatProvider>
              </ModalProvider>
            </FriendsProvider>
          </WebSocketProvider>
        </DDragonProvider>
      </UserProvider>
    </ClerkProvider>
    </body>
    </html>
  );
}
