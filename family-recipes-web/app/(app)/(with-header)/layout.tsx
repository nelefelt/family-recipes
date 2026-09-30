import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";

export default function HeaderLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
