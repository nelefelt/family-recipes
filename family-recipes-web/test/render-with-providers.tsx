import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";

export const renderWithProviders = (ui: ReactElement) => {
  // A new client per test keeps the cache from leaking between tests.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // As a wrapper, the provider survives rerender, so a test can switch view and keep the same cache.
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {
    queryClient,
    user: userEvent.setup(),
    ...render(ui, { wrapper }),
  };
};
