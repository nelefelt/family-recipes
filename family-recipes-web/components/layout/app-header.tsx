import { ChefHat, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeaderAccount } from "@/components/layout/header-account";

export const AppHeader = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <nav
        aria-label="Huvudnavigation"
        className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-6"
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 justify-self-start rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <ChefHat aria-hidden="true" className="size-5" />
          </span>
          <span className="truncate font-heading text-lg font-medium tracking-tight text-foreground">
            Nelefelts recept
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full bg-secondary/60 p-1 md:flex">
          <Link
            href="/"
            aria-current="page"
            className="rounded-full bg-card px-4 py-1.5 text-sm font-semibold text-foreground shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            Recept
          </Link>
          <span className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground">Favoriter</span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button asChild className="hidden h-10 rounded-full px-4 shadow-sm shadow-primary/20 md:inline-flex">
            <Link href="/recipes/new">
              <Plus aria-hidden="true" />
              Nytt recept
            </Link>
          </Button>
          <HeaderAccount />
        </div>
      </nav>
    </header>
  );
};
