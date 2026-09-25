"use client";

import { useCurrentUser } from "@/features/users/hooks/use-current-user";

export const CurrentUserName = () => {
  const { data: user } = useCurrentUser();

  if (!user) {
    return null;
  }

  return <span>{user.name}</span>;
};
