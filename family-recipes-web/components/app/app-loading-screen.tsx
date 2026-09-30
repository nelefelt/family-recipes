import { ChefHat, Loader2 } from "lucide-react";

export const AppLoadingScreen = () => (
  <div role="status" className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-5">
    <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
      <ChefHat aria-hidden="true" className="size-7" />
    </div>
    <Loader2 aria-hidden="true" className="size-5 animate-spin text-muted-foreground" />
    <span className="sr-only">Laddar...</span>
  </div>
);
