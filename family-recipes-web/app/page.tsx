import { AuthButton } from "@/features/auth/auth-button";
import { CurrentUserName } from "@/features/users/components/current-user-name";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Family Recipes</h1>
      <div className="flex flex-wrap items-center gap-3">
        <CurrentUserName />
        <AuthButton />
      </div>
    </main>
  );
}
