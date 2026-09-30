import { Plus } from "lucide-react";
import Link from "next/link";

export const MobileCreateRecipeButton = () => (
  <>
    <div aria-hidden="true" className="h-24 md:hidden" />
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 flex justify-center md:hidden">
      <Link
        href="/recipes/new"
        className="pointer-events-auto flex h-14 items-center gap-2 rounded-full bg-primary pr-6 pl-5 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 ring-1 ring-white/10 outline-none transition-transform active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Plus aria-hidden="true" className="size-5" />
        Nytt recept
      </Link>
    </div>
  </>
);
