import { ChefHat, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeaderAccount } from "@/components/layout/header-account";

export const AppHeader = () => {
  return (
    <header className="border-b border-border bg-background">
      <nav
        aria-label="Huvudnavigation"
        className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 md:h-[72px] md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-6"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <ChefHat aria-hidden="true" />
          </span>
          <span className="truncate text-base font-semibold tracking-tight text-foreground">
            Familjerecept
          </span>
        </div>

        <div className="hidden h-full items-center justify-center md:flex">
          <button
            type="button"
            aria-current="page"
            className="relative flex h-full items-center px-3 text-sm font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            Recept
            <span aria-hidden="true" className="absolute inset-x-3 bottom-0 h-px bg-primary" />
          </button>
          <button
            type="button"
            className="flex h-full items-center px-3 text-sm font-medium text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            Favoriter
          </button>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button asChild className="size-11 sm:w-auto sm:px-3.5">
            <Link href="/recipes/new" aria-label="Nytt recept">
              <Plus aria-hidden="true" />
              <span className="hidden sm:inline">Nytt recept</span>
            </Link>
          </Button>
          <HeaderAccount />
        </div>
      </nav>
    </header>
  );
}
