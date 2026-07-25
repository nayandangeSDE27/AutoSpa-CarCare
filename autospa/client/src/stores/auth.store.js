import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Auth + light UI state only. Server data lives in TanStack Query, never here.
 * Tokens are persisted so a session survives reload; the user object is
 * re-fetched via GET /auth/me on app load (see useAuthBootstrap).
 *
 * Note: refreshToken is kept here because the backend returns it in the login
 * body and the Axios refresh flow needs it; only tokens are persisted.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // Full login result from the API.
      login: ({ user, accessToken, refreshToken }) =>
        set({ user: user ?? null, accessToken, refreshToken, isAuthenticated: Boolean(accessToken) }),

      // Rotate the access token (after a refresh); keep the refresh token.
      setToken: (accessToken, refreshToken) =>
        set((s) => ({
          accessToken,
          refreshToken: refreshToken ?? s.refreshToken,
          isAuthenticated: Boolean(accessToken),
        })),

      setUser: (user) => set({ user }),

      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'autospa-auth',
      // Persist only tokens; user is rehydrated from /auth/me.
      partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) state.isAuthenticated = true
      },
    }
  )
)

export default useAuthStore
