// Validerar vilken intern sida användaren ska skickas tillbaka till efter inloggningen och förhindrar osäkra externa redirects.

const defaultReturnUrl = "/";
const loginPath = "/login";
const placeholderOrigin = "http://localhost";

export function getSafeReturnUrl(value: string | string[] | undefined): string {
  if (typeof value !== "string") return defaultReturnUrl;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return defaultReturnUrl;

  const url = new URL(value, placeholderOrigin);

  if (url.origin !== placeholderOrigin) return defaultReturnUrl;
  if (url.pathname === loginPath || url.pathname.startsWith(`${loginPath}/`)) return defaultReturnUrl;

  return `${url.pathname}${url.search}${url.hash}`;
}
