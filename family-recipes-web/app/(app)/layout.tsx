import type { ReactNode } from "react";
import { CurrentUserBootstrap } from "@/components/app/current-user-bootstrap";
import { AppHeader } from "@/components/layout/app-header";
import { AppHeaderGate } from "@/components/layout/app-header-gate";
import { AuthGuard } from "@/features/auth/auth-guard";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <CurrentUserBootstrap>
        <AppHeaderGate>
          <AppHeader />
        </AppHeaderGate>
        {children}
      </CurrentUserBootstrap>
    </AuthGuard>
  );
}
