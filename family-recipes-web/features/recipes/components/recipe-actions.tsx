"use client";

import { CircleAlert, Ellipsis, Loader2, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "cn";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteRecipe } from "@/features/recipes/hooks/use-delete-recipe";
import { toastTitleMaxLength, truncateText } from "@/lib/truncate-text";

interface RecipeActionsProps {
  recipeId: number;
  recipeTitle: string;
}

const menuItemClassName = "h-11 gap-2.5 rounded-xl px-3 text-[15px] font-medium";
const dialogButtonClassName = "h-12 w-full rounded-2xl text-[15px] font-semibold";

export const RecipeActions = ({ recipeId, recipeTitle }: RecipeActionsProps) => {
  const router = useRouter();
  const deleteRecipeMutation = useDeleteRecipe();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const isDeleting = deleteRecipeMutation.isPending;

  const handleOpenChange = (open: boolean) => {
    if (isDeleting) return;

    setIsConfirmOpen(open);

    if (!open) {
      deleteRecipeMutation.reset();
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRecipeMutation.mutateAsync(recipeId);
      setIsConfirmOpen(false);
      toast.success("Receptet har raderats", {
        description: `"${truncateText(recipeTitle, toastTitleMaxLength)}" finns inte längre bland recepten.`,
      });
      router.replace("/");
    } catch {
      // The dialog stays open and shows the mutation error.
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Hantera recept"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-foreground shadow-sm ring-1 ring-border/70 outline-none transition-all hover:bg-secondary/60 focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-95 data-[state=open]:bg-secondary data-[state=open]:ring-primary/25"
        >
          <Ellipsis aria-hidden="true" className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-2xl p-1.5 shadow-lg">
          <DropdownMenuItem className={menuItemClassName}>
            <Pencil aria-hidden="true" className="size-[18px]" />
            Redigera recept
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            variant="destructive"
            className={menuItemClassName}
            onSelect={() => setIsConfirmOpen(true)}
          >
            <Trash2 aria-hidden="true" className="size-[18px]" />
            Radera recept
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isConfirmOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancelButtonRef.current?.focus();
          }}
          className="w-[calc(100%-2rem)] max-w-sm gap-5 rounded-3xl p-6 data-[size=default]:max-w-sm sm:data-[size=default]:max-w-sm"
        >
          <AlertDialogHeader className="place-items-center gap-2 text-center sm:group-data-[size=default]/alert-dialog-content:place-items-center sm:group-data-[size=default]/alert-dialog-content:text-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 aria-hidden="true" className="size-6" />
            </div>
            <AlertDialogTitle className="line-clamp-3 w-full font-heading text-2xl leading-tight font-medium tracking-tight wrap-anywhere">
              Radera ”{recipeTitle}”?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">Det här går inte att ångra.</AlertDialogDescription>
          </AlertDialogHeader>

          {deleteRecipeMutation.error ? (
            <p
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {deleteRecipeMutation.error.message}
            </p>
          ) : null}

          <AlertDialogFooter className="mx-0 mb-0 flex-col gap-2.5 rounded-none border-t-0 bg-transparent p-0 sm:flex-col">
            <Button
              type="button"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
              className={cn(dialogButtonClassName, "bg-destructive text-white hover:bg-destructive/90")}
            >
              {isDeleting ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" />
                  Raderar...
                </>
              ) : (
                "Radera recept"
              )}
            </Button>
            <Button
              ref={cancelButtonRef}
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => handleOpenChange(false)}
              className={dialogButtonClassName}
            >
              Avbryt
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
