"use client";

import { InteractionStatus } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/features/users/hooks/use-current-user";

export function HeaderAccount() {
  const { instance, accounts, inProgress } = useMsal();
  const { data: user } = useCurrentUser();
  const account = instance.getActiveAccount() ?? accounts[0];
  const initial = user?.name.trim().charAt(0).toUpperCase();

  const handleLogout = async () => {
    if (!account) return;

    try {
      await instance.logoutRedirect({ account });
    } catch {
      toast.error("Utloggningen misslyckades. Försök igen.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Konto"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary ring-1 ring-primary/10 transition-shadow outline-none hover:ring-primary/25 focus-visible:ring-3 focus-visible:ring-ring/40 data-[state=open]:ring-primary/30"
      >
        {initial ?? "?"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60 rounded-2xl p-1.5">
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2.5 py-2">
          <span className="truncate text-sm font-semibold text-foreground">{user?.name}</span>
          {account?.username ? (
            <span className="truncate text-xs font-normal text-muted-foreground">{account.username}</span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => void handleLogout()}
          disabled={inProgress !== InteractionStatus.None}
          className="h-10 rounded-xl px-2.5"
        >
          <LogOut aria-hidden="true" />
          Logga ut
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
