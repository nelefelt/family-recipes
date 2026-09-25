import { apiBaseUrl } from "@/features/auth/auth-config";
import type { User } from "@/features/users/types/user";

export const getOrCreateCurrentUser = async (
  accessToken: string,
): Promise<User> => {
  const response = await fetch(`${apiBaseUrl}/api/users/me`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  return (await response.json()) as User;
};
