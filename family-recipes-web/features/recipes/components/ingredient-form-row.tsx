"use client";

import type { FieldError, UseFormRegister } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateRecipeFormValues } from "@/features/recipes/schemas/create-recipe-schema";

const fieldClassName =
  "h-12 rounded-xl border-0 bg-background/70 px-3 shadow-none placeholder:text-muted-foreground/50 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary/20 aria-invalid:ring-2 aria-invalid:ring-destructive/30";

type IngredientFormRowProps = {
  index: number;
  register: UseFormRegister<CreateRecipeFormValues>;
  amountError?: FieldError;
  unitError?: FieldError;
  nameError?: FieldError;
  canRemove: boolean;
  onRemove: () => void;
};

export const IngredientFormRow = ({
  index,
  register,
  amountError,
  unitError,
  nameError,
  canRemove,
  onRemove,
}: IngredientFormRowProps) => {
  const amountId = `ingredient-${index}-amount`;
  const unitId = `ingredient-${index}-unit`;
  const nameId = `ingredient-${index}-name`;
  const amountErrorId = `${amountId}-error`;
  const unitErrorId = `${unitId}-error`;
  const nameErrorId = `${nameId}-error`;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-1.5">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,4.5rem)_minmax(0,3.5rem)] gap-2">
          <Input
            id={nameId}
            type="text"
            maxLength={200}
            aria-label="Ingrediens"
            placeholder="Pasta"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? nameErrorId : undefined}
            autoComplete="off"
            className={fieldClassName}
            {...register(`ingredients.${index}.name`)}
          />
          <Input
            id={amountId}
            type="text"
            inputMode="decimal"
            aria-label="Mängd"
            placeholder="250"
            aria-invalid={Boolean(amountError)}
            aria-describedby={amountError ? amountErrorId : undefined}
            autoComplete="off"
            className={fieldClassName}
            {...register(`ingredients.${index}.amount`)}
          />
          <Input
            id={unitId}
            type="text"
            maxLength={50}
            aria-label="Enhet"
            placeholder="g"
            aria-invalid={Boolean(unitError)}
            aria-describedby={unitError ? unitErrorId : undefined}
            autoComplete="off"
            className={fieldClassName}
            {...register(`ingredients.${index}.unit`)}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          aria-label="Ta bort ingrediens"
          disabled={!canRemove}
          onClick={onRemove}
          className="size-10 justify-self-center rounded-full text-muted-foreground transition-colors hover:bg-warm/10 hover:text-warm disabled:opacity-30"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
      {amountError ? (
        <p id={amountErrorId} role="alert" className="px-1 text-xs font-medium text-destructive">
          {amountError.message}
        </p>
      ) : null}
      {unitError ? (
        <p id={unitErrorId} role="alert" className="px-1 text-xs font-medium text-destructive">
          {unitError.message}
        </p>
      ) : null}
      {nameError ? (
        <p id={nameErrorId} role="alert" className="px-1 text-xs font-medium text-destructive">
          {nameError.message}
        </p>
      ) : null}
    </div>
  );
};
