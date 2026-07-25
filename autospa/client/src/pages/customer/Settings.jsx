import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Bell, ShieldCheck, Smartphone } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { cn } from '../../lib/utils.js'
import { useAuthStore } from '../../stores/auth.store.js'

const STORAGE_KEY = 'autospa-settings'
const DEFAULTS = {
  emailUpdates: true,
  bookingReminders: true,
  promos: false,
  shareUsage: false,
  compactMode: false,
}

const GROUPS = [
  { title: 'Notifications', icon: Bell, items: [
    { key: 'emailUpdates', label: 'Email updates', desc: 'Booking status changes by email' },
    { key: 'bookingReminders', label: 'Booking reminders', desc: 'Reminders before your appointment' },
    { key: 'promos', label: 'Promotions', desc: 'Deals and offers from garages' },
  ] },
  { title: 'Privacy', icon: ShieldCheck, items: [
    { key: 'shareUsage', label: 'Share usage data', desc: 'Help improve AutoSpa anonymously' },
  ] },
  { title: 'App', icon: Smartphone, items: [
    { key: 'compactMode', label: 'Compact mode', desc: 'Denser layout (UI preference)' },
  ] },
]

function Toggle({ on, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn('relative h-6 w-11 rounded-full transition-colors', on ? 'bg-primary' : 'bg-control')}
    >
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
    </button>
  )
}

export default function Settings() {
  const logout = useAuthStore((s) => s.logout)
  const [prefs, setPrefs] = useState(DEFAULTS)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      setPrefs({ ...DEFAULTS, ...saved })
    } catch { /* ignore */ }
  }, [])

  // Auto-save feel: persist immediately on toggle.
  const toggle = (key) => {
    setPrefs((p) => {
      const next = { ...p, [key]: !p[key] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      toast.success('Saved', { id: 'settings-save' })
      return next
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold text-content">Settings</h1>
      <p className="mb-6 text-content-secondary">Preferences save automatically on this device.</p>

      <div className="space-y-4">
        {GROUPS.map((group) => (
          <Card key={group.title}>
            <CardContent>
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-content"><group.icon className="h-4 w-4 text-primary" /> {group.title}</h2>
              <div className="divide-y divide-hairline">
                {group.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-content">{item.label}</p>
                      <p className="text-sm text-content-secondary">{item.desc}</p>
                    </div>
                    <Toggle on={prefs[item.key]} onClick={() => toggle(item.key)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent>
            <h2 className="mb-3 font-semibold text-content">Account</h2>
            <Button variant="danger" onClick={logout}>Log out</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
