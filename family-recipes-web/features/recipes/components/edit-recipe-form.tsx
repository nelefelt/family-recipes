"use client";

import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RecipeRequestError } from "@/features/recipes/api/recipe-request-error";
import { RecipeForm } from "@/features/recipes/components/recipe-form";
import { useRecipe } from "@/features/recipes/hooks/use-recipe";
import { useUpdateRecipe } from "@/features/recipes/hooks/use-update-recipe";
import { toRecipeFormValues } from "@/features/recipes/mappers/to-recipe-form-values";
import { toUpdateRecipeRequest } from "@/features/recipes/mappers/to-recipe-request";
import type { RecipeFormValues } from "@/features/recipes/schemas/recipe-form-schema";
import { useCurrentUser } from "@/features/users/hooks/use-current-user";
import { toastTitleMaxLength, truncateText } from "@/lib/truncate-text";

interface EditRecipeFormProps {
  recipeId: number;
}

export const EditRecipeForm = ({ recipeId }: EditRecipeFormProps) => {
  const router = useRouter();
  const { data: recipe, error, isPending, isPlaceholderData, isRefetching, refetch } = useRecipe(recipeId);
  const { data: currentUser } = useCurrentUser();
  const updateRecipeMutation = useUpdateRecipe(recipeId);

  // The list cache can be older than the recipe, so the form waits for the detail response.
  if (isPending || isPlaceholderData) {
    return <EditRecipeFormSkeleton />;
  }

  if (error instanceof RecipeRequestError && error.status === 404) {
    return (
      <EditRecipeMessage
        title="Receptet finns inte"
        description="Det kan ha tagits bort, eller så är länken fel."
        href="/"
        linkLabel="Till recepten"
      />
    );
  }

  if (error || recipe === undefined) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-4 text-sm text-destructive"
      >
        <p className="flex items-start gap-2.5">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error?.message ?? "Receptet kunde inte hämtas. Försök igen."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void refetch()}
          disabled={isRefetching}
          className="h-10 rounded-xl px-4"
        >
          Försök igen
        </Button>
      </div>
    );
  }

  // CurrentUserBootstrap renders pages only after the user has loaded, so this is not an ownership failure.
  if (currentUser === undefined) {
    return <EditRecipeFormSkeleton />;
  }

  if (currentUser.id !== recipe.createdByUserId) {
    return (
      <EditRecipeMessage
        title="Du kan inte redigera receptet"
        description="Du kan bara redigera recept som du själv har skapat."
        href={`/recipes/${recipeId}`}
        linkLabel="Tillbaka till receptet"
      />
    );
  }

  const handleSubmit = (values: RecipeFormValues) => {
    updateRecipeMutation.mutate(toUpdateRecipeRequest(values), {
      onSuccess: (updatedRecipe) => {
        toast.success("Receptet har uppdaterats", {
          description: `"${truncateText(updatedRecipe.title, toastTitleMaxLength)}" har sparats.`,
        });
        router.replace(`/recipes/${recipeId}`);
      },
    });
  };

  return (
    <RecipeForm
      defaultValues={toRecipeFormValues(recipe)}
      submitLabel="Spara ändringar"
      pendingLabel="Sparar..."
      isPending={updateRecipeMutation.isPending}
      errorMessage={updateRecipeMutation.error?.message}
      onSubmit={handleSubmit}
    />
  );
};

const EditRecipeFormSkeleton = () => (
  <div aria-busy="true" className="flex flex-col gap-4">
    <span className="sr-only">Laddar recept...</span>
    <div aria-hidden="true" className="h-56 animate-pulse rounded-3xl bg-card ring-1 ring-border/50" />
    <div aria-hidden="true" className="h-48 animate-pulse rounded-3xl bg-card ring-1 ring-border/50" />
    <div aria-hidden="true" className="h-56 animate-pulse rounded-3xl bg-card ring-1 ring-border/50" />
  </div>
);

interface EditRecipeMessageProps {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}

const EditRecipeMessage = ({ title, description, href, linkLabel }: EditRecipeMessageProps) => (
  <div className="flex flex-col items-start gap-3 rounded-3xl bg-card px-6 py-10 shadow-sm ring-1 ring-border/50">
    <h2 className="font-heading text-3xl font-medium tracking-tight text-foreground">{title}</h2>
    <p className="text-sm text-muted-foreground">{description}</p>
    <Button asChild className="h-11 rounded-xl px-4">
      <Link href={href}>{linkLabel}</Link>
    </Button>
  </div>
);
