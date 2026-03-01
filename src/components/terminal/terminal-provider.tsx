"use client";

import { createContext, useState, type ReactNode } from "react";

interface TerminalContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const TerminalContext = createContext<TerminalContextValue>({
  isOpen: false,
  setIsOpen: () => {},
});

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TerminalContext value={{ isOpen, setIsOpen }}>
      {children}
    </TerminalContext>
  );
}
