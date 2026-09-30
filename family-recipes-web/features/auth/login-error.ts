// Sparar och hämtar fel som kan uppstå under Microsofts redirectflöde.

import { AuthError } from "@azure/msal-browser";

const loginErrorStorageKey = "family-recipes.login-error";
const cancelledErrorCodes = new Set(["user_cancelled", "access_denied"]);

export function saveLoginError(error: unknown): void {
  sessionStorage.setItem(loginErrorStorageKey, getLoginErrorMessage(error));
}

export function readLoginError(): string | null {
  return sessionStorage.getItem(loginErrorStorageKey);
}

export function clearLoginError(): void {
  sessionStorage.removeItem(loginErrorStorageKey);
}

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof AuthError && cancelledErrorCodes.has(error.errorCode)) return "Inloggningen avbröts.";

  return "Inloggningen misslyckades. Försök igen.";
}
