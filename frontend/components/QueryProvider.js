"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }) {
  // Stable query client per component tree with performance caching
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute fresh
            gcTime: 5 * 60 * 1000, // 5 minutes cache
            refetchOnWindowFocus: false, // Prevent UI freezes/hangs on click/tab focus
            refetchOnReconnect: false,
            retry: 1, // Fast failover instead of blocking retry loops
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
