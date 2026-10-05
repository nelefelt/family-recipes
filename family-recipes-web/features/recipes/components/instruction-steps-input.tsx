"use client";

import { useLayoutEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";

type InstructionStepsInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  invalid: boolean;
  describedBy?: string;
};

type PendingFocus = {
  index: number;
  caret: number;
};

export const InstructionStepsInput = ({ value, onChange, onBlur, invalid, describedBy }: InstructionStepsInputProps) => {
  const steps = value.split(/\r?\n/);
  const stepRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const pendingFocusRef = useRef<PendingFocus | null>(null);

  // The step to focus only exists after the parent has re-rendered with the new value.
  useLayoutEffect(() => {
    const pendingFocus = pendingFocusRef.current;

    if (pendingFocus === null) return;

    pendingFocusRef.current = null;
    const step = stepRefs.current[pendingFocus.index];
    step?.focus();
    step?.setSelectionRange(pendingFocus.caret, pendingFocus.caret);
  });

  const replaceSteps = (nextSteps: string[], focus?: PendingFocus) => {
    pendingFocusRef.current = focus ?? null;
    onChange(nextSteps.join("\n"));
  };

  // Enter and multi-line paste insert "\n" into the step, which splits it into several steps.
  const handleStepChange = (index: number, event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value.replace(/\r/g, "");
    const caret = event.target.selectionStart;
    const textBeforeCaret = text.slice(0, caret);
    const insertedLines = text.split("\n");
    const nextSteps = [...steps.slice(0, index), ...insertedLines, ...steps.slice(index + 1)];

    if (insertedLines.length === 1) {
      replaceSteps(nextSteps);
      return;
    }

    const lineOffset = textBeforeCaret.split("\n").length - 1;
    const caretInLine = caret - (textBeforeCaret.lastIndexOf("\n") + 1);

    replaceSteps(nextSteps, { index: index + lineOffset, caret: caretInLine });
  };

  const handleStepKeyDown = (index: number, event: KeyboardEvent<HTMLTextAreaElement>) => {
    const { selectionStart, selectionEnd, value: stepText } = event.currentTarget;
    const hasSelection = selectionStart !== selectionEnd;

    if (event.key === "Backspace" && !hasSelection && selectionStart === 0 && index > 0) {
      event.preventDefault();
      const previousStep = steps[index - 1];
      const nextSteps = [...steps.slice(0, index - 1), previousStep + stepText, ...steps.slice(index + 1)];

      replaceSteps(nextSteps, { index: index - 1, caret: previousStep.length });
      return;
    }

    if (event.key === "Delete" && !hasSelection && selectionStart === stepText.length && index < steps.length - 1) {
      event.preventDefault();
      const nextSteps = [...steps.slice(0, index), stepText + steps[index + 1], ...steps.slice(index + 2)];

      replaceSteps(nextSteps, { index, caret: stepText.length });
    }
  };

  return (
    <ol
      data-invalid={invalid || undefined}
      className="flex flex-col gap-2 rounded-xl bg-background/70 px-3 py-3 transition-colors focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20 data-invalid:ring-2 data-invalid:ring-destructive/30"
    >
      {steps.map((step, index) => (
        <li key={index} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary"
          >
            {index + 1}
          </span>
          <textarea
            ref={(element) => {
              stepRefs.current[index] = element;
            }}
            rows={1}
            value={step}
            aria-label={`Steg ${index + 1}`}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            placeholder={steps.length === 1 ? "Beskriv första steget" : undefined}
            onChange={(event) => handleStepChange(index, event)}
            onKeyDown={(event) => handleStepKeyDown(index, event)}
            onBlur={onBlur}
            className="min-h-8 w-full min-w-0 resize-none bg-transparent py-1 text-sm leading-relaxed text-foreground outline-none field-sizing-content placeholder:text-muted-foreground/50"
          />
        </li>
      ))}
    </ol>
  );
};
