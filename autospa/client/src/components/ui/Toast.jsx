import { Toaster } from 'react-hot-toast'

/**
 * App-wide toast host, themed to the palette. Mounted once at the root.
 * Use `import toast from 'react-hot-toast'` anywhere to fire toasts:
 *   toast.success('Saved'), toast.error('Failed').
 */
export default function ToastHost() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-control)',
          boxShadow: 'var(--shadow-pop)',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: 'var(--primary)', secondary: '#ffffff' },
        },
        error: {
          iconTheme: { primary: 'var(--danger)', secondary: '#ffffff' },
        },
      }}
    />
  )
}
