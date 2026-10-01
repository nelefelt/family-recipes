export class RecipeRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "RecipeRequestError";
    this.status = status;
  }
}
