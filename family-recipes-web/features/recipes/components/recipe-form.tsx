"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, FileText, Leaf, ListOrdered, Loader2, Plus } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IngredientFormRow } from "@/features/recipes/components/ingredient-form-row";
import { InstructionStepsInput } from "@/features/recipes/components/instruction-steps-input";
import { createEmptyIngredient } from "@/features/recipes/schemas/recipe-form-default-values";
import { recipeFormSchema, type RecipeFormValues } from "@/features/recipes/schemas/recipe-form-schema";

type RecipeFormProps = {
  defaultValues: RecipeFormValues;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (values: RecipeFormValues) => void;
};

export const RecipeForm = ({
  defaultValues,
  submitLabel,
  pendingLabel,
  isPending,
  errorMessage,
  onSubmit,
}: RecipeFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const canRemoveIngredient = fields.length > 1;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full min-w-0 flex-col gap-4">
      <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/50 sm:p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-secondary/70 text-primary">
            <FileText aria-hidden="true" className="size-[18px]" />
          </div>
          <h2 className="font-sans text-base font-bold text-foreground">Om receptet</h2>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recipe-title" className="text-[13px] font-medium text-foreground">
            Titel
          </Label>
          <Input
            id="recipe-title"
            type="text"
            maxLength={200}
            placeholder="Lasagne"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "recipe-title-error" : undefined}
            className="h-12 rounded-xl border-0 bg-background/70 px-4 shadow-none placeholder:text-muted-foreground/50 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary/20"
            {...register("title")}
          />
          {errors.title ? (
            <p id="recipe-title-error" role="alert" className="px-1 text-xs font-medium text-destructive">
              {errors.title.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recipe-description" className="text-[13px] font-medium text-foreground">
            Beskrivning
          </Label>
          <Textarea
            id="recipe-description"
            maxLength={2000}
            rows={3}
            placeholder="En kort beskrivning av receptet"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "recipe-description-error" : undefined}
            className="field-sizing-fixed resize-none rounded-xl border-0 bg-background/70 px-4 py-3 shadow-none placeholder:text-muted-foreground/50 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary/20"
            {...register("description")}
          />
          {errors.description ? (
            <p id="recipe-description-error" role="alert" className="px-1 text-xs font-medium text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/50 sm:p-6">
        <fieldset className="flex min-w-0 flex-col gap-2.5 border-0 p-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-secondary/70 text-primary">
              <Leaf aria-hidden="true" className="size-[18px]" />
            </div>
            <legend className="font-sans text-base font-bold text-foreground">Ingredienser</legend>
          </div>

          <div className="mt-1 grid min-w-0 grid-cols-[minmax(0,1fr)_2.5rem] items-end gap-1.5">
            <div
              aria-hidden="true"
              className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,4.5rem)_minmax(0,3.5rem)] gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
            >
              <span className="truncate">Ingrediens</span>
              <span className="truncate">Mängd</span>
              <span className="truncate">Enhet</span>
            </div>
            <span aria-hidden="true" className="size-10" />
          </div>
          {fields.map((field, index) => (
            <IngredientFormRow
              key={field.id}
              index={index}
              register={register}
              amountError={errors.ingredients?.[index]?.amount}
              unitError={errors.ingredients?.[index]?.unit}
              nameError={errors.ingredients?.[index]?.name}
              canRemove={canRemoveIngredient}
              onRemove={() => remove(index)}
            />
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={() => append(createEmptyIngredient())}
            className="mt-1 h-12 w-full rounded-full border-2 border-dashed border-primary/25 bg-card text-primary transition-colors hover:border-primary/35 hover:bg-secondary/40 hover:text-primary"
          >
            <Plus aria-hidden="true" />
            Lägg till ingrediens
          </Button>
        </fieldset>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/50 sm:p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-secondary/70 text-primary">
            <ListOrdered aria-hidden="true" className="size-[18px]" />
          </div>
          <h2 className="font-sans text-base font-bold text-foreground">Gör så här</h2>
        </div>

        <div className="flex flex-col gap-1.5">
          <Controller
            control={control}
            name="instructions"
            render={({ field }) => (
              <InstructionStepsInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={Boolean(errors.instructions)}
                describedBy={errors.instructions ? "recipe-instructions-error" : undefined}
              />
            )}
          />
          <p className="px-1 text-xs text-muted-foreground">
            Tryck Enter för ett nytt steg. Sudda i början av ett steg för att slå ihop det med steget ovanför.
          </p>
          {errors.instructions ? (
            <p id="recipe-instructions-error" role="alert" className="px-1 text-xs font-medium text-destructive">
              {errors.instructions.message}
            </p>
          ) : null}
        </div>
      </section>

      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="h-14 w-full rounded-2xl text-base font-semibold shadow-md shadow-primary/15 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20 active:translate-y-0 disabled:translate-y-0 disabled:bg-primary disabled:opacity-80"
      >
        {isPending ? (
          <>
            <Loader2 aria-hidden="true" className="animate-spin" />
            {pendingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
};
