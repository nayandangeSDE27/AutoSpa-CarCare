import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import { cn } from '../../lib/utils.js'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/**
 * Accessible modal: backdrop, Escape to close, focus trap, restores focus on
 * close, and a tasteful (not flashy) fade + scale via Framer Motion.
 */
export default function Modal({ open, onClose, title, children, className, footer }) {
  const panelRef = useRef(null)
  const lastFocused = useRef(null)
  // Keep the latest onClose without making it an effect dependency — otherwise
  // an inline onClose (new identity each render) would re-run the focus effect
  // on every keystroke and steal focus out of inputs.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    lastFocused.current = document.activeElement

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.()
        return
      }
      if (e.key === 'Tab' && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll(FOCUSABLE)
        if (nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    // Focus the panel (or its first focusable) once mounted.
    const t = setTimeout(() => {
      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE)
      ;(nodes && nodes.length ? nodes[0] : panelRef.current)?.focus()
    }, 0)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      clearTimeout(t)
      lastFocused.current?.focus?.()
    }
    // Only re-run when the modal opens/closes — NOT when onClose identity changes.
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-[var(--primary-deep)]/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
            tabIndex={-1}
            className={cn(
              'relative z-10 w-full max-w-md rounded-card border border-hairline bg-surface shadow-pop',
              'focus:outline-none',
              className
            )}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="flex items-start justify-between px-5 pt-5">
              {title && <h2 className="text-lg font-semibold text-content">{title}</h2>}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="ml-auto rounded-control p-1 text-content-muted hover:bg-accent-light hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-content-secondary">{children}</div>
            {footer && <div className="flex justify-end gap-2 px-5 pb-5">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
