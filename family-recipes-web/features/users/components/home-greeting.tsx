"use client";

import { useCurrentUser } from "@/features/users/hooks/use-current-user";

export function HomeGreeting() {
  const { data: user } = useCurrentUser();
  const greeting = getGreeting(new Date().getHours());
  const firstName = user?.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-4xl leading-tight font-medium tracking-tight text-foreground md:text-5xl">
        {firstName ? `${greeting}, ${firstName}` : greeting}
      </h1>
      <p className="text-base text-muted-foreground md:text-lg">Vad blir det för mat idag?</p>
    </div>
  );
}

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 10) return "God morgon";
  if (hour >= 10 && hour < 18) return "Hej";

  return "God kväll";
}
