"use client";
import React, {createContext, ReactNode, useContext, useState} from "react";

interface ModalContextType {
  isOpen: boolean;
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
  modalContent: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({children}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);

  const openModal = (content: ReactNode) => {
    setModalContent(content);
    setIsOpen(true);
    // Desactivar el scroll del body cuando el modal está abierto
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsOpen(false);
    // Reactivar el scroll del body cuando el modal se cierra
    document.body.style.overflow = "";
    // Limpiar el contenido después de cerrar con un pequeño retraso
    setTimeout(() => {
      setModalContent(null);
    }, 200);
  };

  return (
    <ModalContext.Provider value={{isOpen, openModal, closeModal, modalContent}}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
