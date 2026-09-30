"use client";

import { AuthButton } from "@/features/auth/auth-button";
import { useCurrentUser } from "@/features/users/hooks/use-current-user";

export function HeaderAccount() {
  const { data: user } = useCurrentUser();
  const initial = user?.name.trim().charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      {initial ? (
        <span
          role="img"
          aria-label={user?.name}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-sm font-semibold text-foreground"
        >
          {initial}
        </span>
      ) : null}
      <AuthButton />
    </div>
  );
}
