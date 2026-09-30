import createClient from "openapi-fetch";
import { apiBaseUrl } from "@/features/auth/auth-config";
import type { paths } from "@/lib/api/generated/schema";

export const apiClient = createClient<paths>({
  baseUrl: apiBaseUrl,
});
