"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

export const AppHeaderGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  if (pathname === "/recipes/new") {
    return null;
  }

  return children;
};
