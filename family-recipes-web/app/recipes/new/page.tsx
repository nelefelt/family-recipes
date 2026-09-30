import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateRecipeForm } from "@/features/recipes/components/create-recipe-form";

export default function NewRecipePage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-lg flex-1 flex-col px-4 pb-10 sm:px-6 sm:pb-16">
      <div className="relative mb-5 flex h-14 items-center justify-between">
        <Link
          href="/"
          aria-label="Tillbaka till recept"
          className="relative z-10 flex size-11 items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>
        <h1 className="pointer-events-none absolute inset-x-0 text-center font-heading text-xl font-medium tracking-tight text-foreground">
          Nytt recept
        </h1>
        <span className="relative z-10 text-sm font-medium text-muted-foreground">
          Spara utkast
        </span>
      </div>
      <CreateRecipeForm />
    </main>
  );
}
