import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface RecipeFormPageHeaderProps {
  title: string;
  backHref: string;
  backLabel: string;
  action?: ReactNode;
}

// The save action sits in the top bar, as in native iOS and Android apps, so it never ends up on top of
// the on-screen keyboard. Sticky keeps it reachable while scrolling a long recipe.
export const RecipeFormPageHeader = ({ title, backHref, backLabel, action }: RecipeFormPageHeaderProps) => (
  <header className="sticky top-0 z-30 -mx-4 mb-5 flex h-14 items-center justify-between bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sm:-mx-6 sm:px-6">
    <Link
      href={backHref}
      aria-label={backLabel}
      className="relative z-10 flex size-11 items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <ArrowLeft aria-hidden="true" className="size-5" />
    </Link>
    <h1 className="pointer-events-none absolute inset-x-0 text-center font-heading text-xl font-medium tracking-tight text-foreground">
      {title}
    </h1>
    <div className="relative z-10">{action}</div>
  </header>
);

interface SaveRecipeButtonProps {
  formId: string;
  isPending: boolean;
  disabled?: boolean;
}

// Submits the form through the form attribute, so it works from the header outside the <form> element.
export const SaveRecipeButton = ({ formId, isPending, disabled = false }: SaveRecipeButtonProps) => (
  <Button
    type="submit"
    form={formId}
    disabled={isPending || disabled}
    className="h-9 rounded-full px-4 text-sm font-semibold"
  >
    {isPending ? (
      <>
        <Loader2 aria-hidden="true" className="animate-spin" />
        Sparar...
      </>
    ) : (
      "Spara"
    )}
  </Button>
);
