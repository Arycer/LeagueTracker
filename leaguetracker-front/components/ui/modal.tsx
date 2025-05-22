"use client";
import React, {useEffect} from "react";
import {useModal} from "@/contexts/ModalContext";
import {AnimatePresence, motion} from "framer-motion";

export const Modal: React.FC = () => {
  const {isOpen, closeModal, modalContent} = useModal();

  // Manejar cierre con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeModal]);

  // Manejar cierre al hacer clic fuera del contenido modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.2}}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{scale: 0.95, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            exit={{scale: 0.95, opacity: 0}}
            transition={{duration: 0.2}}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {modalContent}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
