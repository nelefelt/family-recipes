import type { ReactNode } from "react";
import { CurrentUserBootstrap } from "@/features/users/components/current-user-bootstrap";
import { AuthGuard } from "@/features/auth/components/auth-guard";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <CurrentUserBootstrap>{children}</CurrentUserBootstrap>
    </AuthGuard>
  );
}
