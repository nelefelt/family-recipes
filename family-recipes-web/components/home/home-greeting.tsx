"use client";

import { useCurrentUser } from "@/features/users/hooks/use-current-user";

export function HomeGreeting() {
  const { data: user } = useCurrentUser();

  return (
    <p className="text-sm font-medium text-muted-foreground">
      {user ? `God kväll, ${user.name}` : "God kväll"}
    </p>
  );
}
