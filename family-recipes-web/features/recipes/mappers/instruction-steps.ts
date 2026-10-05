export function removeEmptyInstructionSteps(instructions: string): string {
  return instructions
    .split(/\r?\n/)
    .map((step) => step.trim())
    .filter((step) => step.length > 0)
    .join("\n");
}
