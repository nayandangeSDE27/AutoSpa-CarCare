import { Link } from 'react-router-dom'

import { Card } from '../../components/ui/Card.jsx'

/** Centered card shell for auth pages. */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <Link to="/" className="mb-6 flex justify-center">
        <img src="/autospa-logo-horizontal.svg" alt="AutoSpa" className="h-10 w-auto" />
      </Link>
      <Card className="p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-content">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-content-secondary">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </Card>
      {footer && <div className="mt-4 text-center text-sm text-content-secondary">{footer}</div>}
    </div>
  )
}
