import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 -z-10 size-96 rounded-full bg-secondary blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 -z-10 size-[28rem] rounded-full bg-warm/10 blur-3xl"
      />
      {children}
    </div>
  );
}
