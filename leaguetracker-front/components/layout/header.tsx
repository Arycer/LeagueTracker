"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {Button} from '../ui/button';
import {SignedIn, SignedOut, SignInButton, SignUpButton, UserButton} from '@clerk/nextjs';
import {useUserContext} from '@/contexts/UserContext';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Menu } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const Header = () => {
  const {user, isLoading} = useUserContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="border-b border-blue-900/20 bg-[#0f172a]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 relative">
        
        <div className="w-[250px] hidden md:flex items-center justify-start">
          <SignedIn>
            <nav className="flex items-center space-x-4 whitespace-nowrap">
              <Link
                href="/friends"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Amigos
              </Link>
              <Link
                href="/linked-accounts"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
                <span className="truncate">Cuentas</span>
              </Link>
              <Link
                href="/chat"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <span className="truncate">Chat</span>
              </Link>
            </nav>
          </SignedIn>
        </div>
        
        
        <div className="md:hidden flex items-center">
          <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <Dialog.Trigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-blue-500/10">
                <Menu className="h-5 w-5" />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
              <Dialog.Content className="fixed left-0 top-0 h-full w-[80%] max-w-[300px] bg-[#0f172a] border-r border-blue-900/20 p-6 shadow-xl z-50 animate-in slide-in-from-left">
                <Dialog.Title asChild>
                  <VisuallyHidden>Menú de navegación</VisuallyHidden>
                </Dialog.Title>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                      <h1 className="text-xl font-bold">
                        <span className="text-blue-400">League</span>
                        <span className="text-white">Tracker</span>
                      </h1>
                    </Link>
                    <Dialog.Close asChild>
                      <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-blue-500/10">
                        <X className="h-4 w-4" />
                      </Button>
                    </Dialog.Close>
                  </div>
                  
                  <div className="space-y-6 flex-1">
                    <SignedIn>
                      <div className="flex items-center gap-3 mb-6 p-3 bg-blue-500/10 rounded-lg">
                        <UserButton
                          afterSignOutUrl="/"
                          appearance={{
                            elements: {
                              avatarBox: "h-10 w-10",
                              userButtonTrigger: "focus:shadow-none focus:ring-2 focus:ring-blue-500 rounded-full"
                            }
                          }}
                        />
                        <div>
                          {!isLoading && user.isSignedIn && (
                            <div className="text-sm font-medium text-white">{user.username}</div>
                          )}
                        </div>
                      </div>
                      <nav className="flex flex-col space-y-4">
                        <Link
                          href="/friends"
                          className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center p-2 hover:bg-blue-500/10 rounded-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor"
                               viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                          </svg>
                          Amigos
                        </Link>
                        <Link
                          href="/linked-accounts"
                          className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center p-2 hover:bg-blue-500/10 rounded-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor"
                               viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                          </svg>
                          Cuentas vinculadas
                        </Link>
                        <Link
                          href="/chat"
                          className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center p-2 hover:bg-blue-500/10 rounded-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor"
                               viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                          </svg>
                          Chat
                        </Link>
                      </nav>
                    </SignedIn>
                    <SignedOut>
                      <div className="flex flex-col space-y-3 mt-6">
                        <SignInButton mode="modal">
                          <Button variant="outline" className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10">
                            Iniciar sesión
                          </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
                            Registrarse
                          </Button>
                        </SignUpButton>
                      </div>
                    </SignedOut>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-500">
              <span className="text-blue-400">League</span>
              <span className="text-white">Tracker</span>
            </h1>
          </Link>
        </div>

        {}
        <div className="flex items-center gap-4 justify-end w-[200px]">
          
          <div className="hidden md:flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
                  Iniciar sesión
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-blue-500 text-white hover:bg-blue-600">
                  Registrarse
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-10 w-10",
                      userButtonTrigger: "focus:shadow-none focus:ring-2 focus:ring-blue-500 rounded-full"
                    }
                  }}
                />
                <div className="text-right mr-2">
                  {!isLoading && user.isSignedIn && (
                    <div className="text-sm font-medium text-white">{user.username}</div>
                  )}
                </div>
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
