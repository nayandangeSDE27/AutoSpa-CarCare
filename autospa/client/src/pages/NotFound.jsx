import { Link } from 'react-router-dom'

import Button from '../components/ui/Button.jsx'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <img src="/autospa-icon.svg" alt="AutoSpa" className="h-14 w-14" />
      <p className="text-6xl font-semibold tracking-tight text-primary">404</p>
      <p className="text-content-secondary">This page couldn’t be found.</p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  )
}
