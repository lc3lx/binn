"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a single instance of QueryClient
const queryClient = new QueryClient();

export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
