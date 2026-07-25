import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * TanStack Query at the app root. Server state lives here (not in Zustand).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 min
      retry: 1,
      refetchOnWindowFocus: false, // off for now
    },
  },
})

export default function QueryProvider({ children }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
