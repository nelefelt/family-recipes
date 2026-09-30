import { HomeGreeting } from "@/features/users/components/home-greeting";
import { MobileCreateRecipeButton } from "@/features/recipes/components/mobile-create-recipe-button";
import { RecipeList } from "@/features/recipes/components/recipe-list";

export default function Home() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-8 md:gap-14 md:px-6 md:py-12">
        <HomeGreeting />

        <section aria-labelledby="recipes-heading" className="flex flex-col gap-5">
          <h2 id="recipes-heading" className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            Senast tillagda
          </h2>
          <RecipeList />
        </section>
      </main>
      <MobileCreateRecipeButton />
    </>
  );
}
