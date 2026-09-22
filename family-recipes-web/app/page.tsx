import { AuthButton } from "@/components/auth/auth-button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Family Recipes</h1>
      <p className="text-muted-foreground">
        Authentication is being tested.
      </p>
      <AuthButton />
    </main>
  );
}
