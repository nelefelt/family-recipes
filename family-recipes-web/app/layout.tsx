import type { Metadata } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import { CurrentUserBootstrap } from "@/components/app/current-user-bootstrap";
import { AppHeader } from "@/components/layout/app-header";
import { AppHeaderGate } from "@/components/layout/app-header-gate";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/auth-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Familjerecept",
  description: "Familjens recept, samlade på ett ställe.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sv"
      className={`${dmSans.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <CurrentUserBootstrap>
              <AppHeaderGate>
                <AppHeader />
              </AppHeaderGate>
              {children}
            </CurrentUserBootstrap>
          </AuthProvider>
        </QueryProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
