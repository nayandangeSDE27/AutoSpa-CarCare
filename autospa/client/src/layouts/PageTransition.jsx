import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'

/**
 * Subtle fade/slide page transition on route change. Respects
 * prefers-reduced-motion (fades only, no movement).
 * Also scrolls to top on every navigation.
 */
export default function PageTransition() {
  const location = useLocation()
  const reduce = useReducedMotion()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: reduce ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduce ? 0 : -8 }}
        transition={{ duration: reduce ? 0.05 : 0.2, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
