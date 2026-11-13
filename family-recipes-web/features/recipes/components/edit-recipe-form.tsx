"use client";

import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RecipeRequestError } from "@/features/recipes/api/recipe-request-error";
import { RecipeForm } from "@/features/recipes/components/recipe-form";
import { RecipeFormPageHeader, SaveRecipeButton } from "@/features/recipes/components/recipe-form-page-header";
import { useRecipe } from "@/features/recipes/hooks/use-recipe";
import { useReloadRecipe } from "@/features/recipes/hooks/use-reload-recipe";
import { useUpdateRecipe } from "@/features/recipes/hooks/use-update-recipe";
import { toRecipeFormValues } from "@/features/recipes/mappers/to-recipe-form-values";
import { toUpdateRecipeRequest } from "@/features/recipes/mappers/to-recipe-request";
import type { RecipeFormValues } from "@/features/recipes/schemas/recipe-form-schema";
import type { RecipeResponse } from "@/features/recipes/types/recipe";
import { useCurrentUser } from "@/features/users/hooks/use-current-user";
import { toastTitleMaxLength, truncateText } from "@/lib/truncate-text";

interface EditRecipeFormProps {
  recipeId: number;
}

export const EditRecipeForm = ({ recipeId }: EditRecipeFormProps) => {
  const { data: recipe, error, isPending, isPlaceholderData, isRefetching, refetch } = useRecipe(recipeId);
  const { data: currentUser } = useCurrentUser();

  // The list cache can be older than the recipe, so the form waits for the detail response.
  if (isPending || isPlaceholderData) {
    return (
      <EditRecipeLayout recipeId={recipeId}>
        <EditRecipeFormSkeleton />
      </EditRecipeLayout>
    );
  }

  // Only without data. A failed background refetch must not replace a form with unsaved changes.
  if (recipe === undefined) {
    if (error instanceof RecipeRequestError && error.status === 404) {
      return (
        <EditRecipeLayout recipeId={recipeId}>
          <EditRecipeMessage
            title="Receptet finns inte"
            description="Det kan ha tagits bort, eller så är länken fel."
            href="/"
            linkLabel="Till recepten"
          />
        </EditRecipeLayout>
      );
    }

    return (
      <EditRecipeLayout recipeId={recipeId}>
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
      </EditRecipeLayout>
    );
  }

  // CurrentUserBootstrap renders pages only after the user has loaded, so this is not an ownership failure.
  if (currentUser === undefined) {
    return (
      <EditRecipeLayout recipeId={recipeId}>
        <EditRecipeFormSkeleton />
      </EditRecipeLayout>
    );
  }

  if (currentUser.id !== recipe.createdByUserId) {
    return (
      <EditRecipeLayout recipeId={recipeId}>
        <EditRecipeMessage
          title="Du kan inte redigera receptet"
          description="Du kan bara redigera recept som du själv har skapat."
          href={`/recipes/${recipeId}`}
          linkLabel="Tillbaka till receptet"
        />
      </EditRecipeLayout>
    );
  }

  // The key starts a new edit session for another recipe, so the snapshot never belongs to the previous one.
  return <EditRecipeFormContent key={recipe.id} initialRecipe={recipe} />;
};

const formId = "edit-recipe-form";

interface EditRecipeLayoutProps {
  recipeId: number;
  action?: ReactNode;
  children: ReactNode;
}

// The header is shown in every state, so the back link is always there. Only the form gets a save button.
const EditRecipeLayout = ({ recipeId, action, children }: EditRecipeLayoutProps) => (
  <>
    <RecipeFormPageHeader
      title="Redigera recept"
      backHref={`/recipes/${recipeId}`}
      backLabel="Tillbaka till receptet"
      action={action}
    />
    {children}
  </>
);

const reloadFailedMessage = "Den senaste versionen kunde inte hämtas. Dina ändringar finns kvar, försök igen.";

interface EditRecipeFormContentProps {
  initialRecipe: RecipeResponse;
}

// The form keeps the recipe it was opened with. Background refetches update the query cache but not
// this snapshot, so a save never sends a newer version together with older form values.
const EditRecipeFormContent = ({ initialRecipe }: EditRecipeFormContentProps) => {
  const router = useRouter();
  const [baseRecipe, setBaseRecipe] = useState(initialRecipe);
  const updateRecipe = useUpdateRecipe(baseRecipe.id);
  const reloadRecipe = useReloadRecipe(baseRecipe.id);
  const hasConflict = updateRecipe.error instanceof RecipeRequestError && updateRecipe.error.status === 409;

  const handleSubmit = (values: RecipeFormValues) => {
    reloadRecipe.reset();
    updateRecipe.mutate(toUpdateRecipeRequest(values, baseRecipe.version), {
      onSuccess: (updatedRecipe) => {
        toast.success("Receptet har uppdaterats", {
          description: `"${truncateText(updatedRecipe.title, toastTitleMaxLength)}" har sparats.`,
        });
        router.replace(`/recipes/${baseRecipe.id}`);
      },
    });
  };

  // Replaces the user's unsaved changes, so it only runs when the user asks for it.
  const handleReloadLatestVersion = () => {
    reloadRecipe.mutate(undefined, {
      onSuccess: (latestRecipe) => {
        updateRecipe.reset();
        setBaseRecipe(latestRecipe);
      },
    });
  };

  return (
    <EditRecipeLayout
      recipeId={baseRecipe.id}
      action={
        <SaveRecipeButton
          formId={formId}
          isPending={updateRecipe.isPending}
          // A save during a reload would send the old version, and the reload would then reset the save.
          disabled={reloadRecipe.isPending}
        />
      }
    >
      <RecipeForm
        key={baseRecipe.version}
        id={formId}
        defaultValues={toRecipeFormValues(baseRecipe)}
        errorMessage={reloadRecipe.isError ? reloadFailedMessage : updateRecipe.error?.message}
        errorAction={
          hasConflict ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleReloadLatestVersion}
              disabled={reloadRecipe.isPending}
              className="h-10 rounded-xl px-4"
            >
              {reloadRecipe.isPending ? "Hämtar..." : "Ladda senaste versionen"}
            </Button>
          ) : undefined
        }
        onSubmit={handleSubmit}
      />
    </EditRecipeLayout>
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
