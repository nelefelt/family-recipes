import { CreateRecipeForm } from "@/features/recipes/components/create-recipe-form";

export default function NewRecipePage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-lg flex-1 flex-col px-4 pb-10 sm:px-6 sm:pb-16">
      <CreateRecipeForm />
    </main>
  );
}
