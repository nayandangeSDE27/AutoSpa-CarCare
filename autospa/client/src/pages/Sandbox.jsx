import { useState } from 'react'
import toast from 'react-hot-toast'
import { Mail, Search, Lock } from 'lucide-react'

import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import { Skeleton } from '../components/ui/Skeleton.jsx'
import { createResponseErrorHandler } from '../api/refreshInterceptor.js'

const SWATCHES = [
  ['primary #0F8A6D', '#0F8A6D', '#fff'],
  ['hover #0B6B54', '#0B6B54', '#fff'],
  ['deep #06231C', '#06231C', '#fff'],
  ['light #E5F4EF', '#E5F4EF', '#06231C'],
  ['mid #8FE8CE', '#8FE8CE', '#06231C'],
  ['header #BDEEDF', '#BDEEDF', '#06231C'],
  ['bg #F7FAF9', '#F7FAF9', '#14201C'],
  ['surface #FFFFFF', '#FFFFFF', '#14201C'],
]

/**
 * THROWAWAY sandbox (Phase 7a-1 self-test). Renders every core component in the
 * teal theme. Delete or replace when real routing/pages land in 7a-2.
 */
export default function Sandbox() {
  const [modalOpen, setModalOpen] = useState(false)

  // In-browser demonstration of the 401 refresh-retry handler (same function the
  // Axios instance uses), driven with mocks so it needs no backend.
  async function testRefreshFlow() {
    const calls = { refresh: 0, retry: 0, authFail: 0 }
    const handler = createResponseErrorHandler({
      refresh: async () => {
        calls.refresh += 1
        return 'new-access-token'
      },
      retry: async (config) => {
        calls.retry += 1
        return { retried: true, auth: config.headers.Authorization }
      },
      onAuthFail: () => {
        calls.authFail += 1
      },
    })
    const result = await handler({ response: { status: 401 }, config: { url: '/cars' } })
    if (calls.refresh === 1 && calls.retry === 1 && result?.retried) {
      toast.success(`401 → refreshed once → retried (${result.auth})`)
    } else {
      toast.error('Refresh flow did not behave as expected')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-content">AutoSpa — Component Sandbox</h1>
        <p className="mt-1 text-content-secondary">
          Phase 7a-1 infrastructure. Inter typeface, LOCKED premium-teal palette. Throwaway page.
        </p>
      </header>

      <Section title="Palette">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SWATCHES.map(([label, bg, fg]) => (
            <div
              key={label}
              className="rounded-control border border-hairline p-3 text-xs font-medium"
              style={{ background: bg, color: fg }}
            >
              {label}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Email" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" />} />
          <Input label="Search" placeholder="Search…" rightIcon={<Search className="h-4 w-4" />} />
          <Input label="Password" type="password" leftIcon={<Lock className="h-4 w-4" />} placeholder="••••••••" />
          <Input label="With error" defaultValue="bad@" error="Enter a valid email address" />
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Premium Wash</CardTitle>
            <CardDescription>Exterior + interior detailing</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-content-secondary">
              A card on a white surface with a hairline border, ~13px radius and a soft shadow.
            </p>
            <p className="tabular mt-3 text-2xl font-semibold text-content">$80.00</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Book now</Button>
            <Button size="sm" variant="secondary">
              Details
            </Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Modal">
        <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Confirm booking"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => setModalOpen(false)}>
                Confirm
              </Button>
            </>
          }
        >
          Focus-trapped, Escape-to-close, fade + scale in/out via Framer Motion.
        </Modal>
      </Section>

      <Section title="Skeleton">
        <div className="max-w-sm space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Section>

      <Section title="Toasts + Axios refresh flow">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => toast.success('Booking confirmed!')}>Success toast</Button>
          <Button variant="danger" onClick={() => toast.error('Something went wrong')}>
            Error toast
          </Button>
          <Button variant="secondary" onClick={testRefreshFlow}>
            Simulate 401 → refresh → retry
          </Button>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-content-muted">{title}</h2>
      {children}
    </section>
  )
}
