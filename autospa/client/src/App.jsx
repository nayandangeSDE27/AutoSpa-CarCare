import AppRoutes from './routes/AppRoutes.jsx'
import { useAuthBootstrap } from './hooks/useAuthBootstrap.js'
import { useSocketConnection } from './hooks/useSocket.js'
import RealtimeBridge from './realtime/RealtimeBridge.jsx'

/**
 * Boots the auth session, drives the socket connection from auth state, and
 * renders the routed app. RealtimeBridge (mounted once) keeps the UI live by
 * invalidating queries on socket events.
 */
export default function App() {
  const { ready } = useAuthBootstrap()
  useSocketConnection()

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-content-secondary">
        Loading…
      </div>
    )
  }

  return (
    <>
      <RealtimeBridge />
      <AppRoutes />
    </>
  )
}
