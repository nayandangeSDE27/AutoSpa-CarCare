import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Bell, Menu, X, Search, User, Settings as SettingsIcon, LogOut, Store, Wrench, Loader2 } from 'lucide-react'

import PageTransition from './PageTransition.jsx'
import Input from '../components/ui/Input.jsx'
import { cn } from '../lib/utils.js'
import { useNotifications } from '../hooks/useNotifications.js'
import { useGarages } from '../hooks/useGarages.js'
import { servicesApi } from '../api/services.api.js'
import { authApi } from '../api/auth.api.js'
import { useAuthStore } from '../stores/auth.store.js'

function NotificationBell() {
  const { data } = useNotifications()
  const role = useAuthStore((s) => s.user?.role)
  const navigate = useNavigate()
  const unread = data?.unread || 0
  const badge = unread > 0 && (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
      {unread > 9 ? '9+' : unread}
    </span>
  )
  const cls = 'relative rounded-control p-2 text-content-secondary hover:bg-accent-light hover:text-content'
  const notificationsPath = role === 'garage_owner' ? '/garage/notifications' : role === 'admin' ? '/admin/notifications' : '/customer/notifications'

  if (role === 'customer') {
    return (
      <Link to={notificationsPath} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} className={cls}>
        <Bell className="h-5 w-5" />{badge}
      </Link>
    )
  }

  return (
    <button type="button" onClick={() => navigate(notificationsPath)} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} className={cls}>
      <Bell className="h-5 w-5" />{badge}
    </button>
  )
}

// Close a popover on outside-click (relative to `ref`) + Escape.
function useDismiss(ref, open, onClose) {
  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [ref, open, onClose])
}

// FIX 1 — avatar dropdown: name/email, Profile, Settings, Logout.
function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const logoutStore = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(ref, open, () => setOpen(false))

  const role = user?.role
  const base = role === 'garage_owner' ? '/garage' : role === 'admin' ? '/admin' : '/customer'
  const hasProfile = role === 'customer' || role === 'garage_owner'
  const initial = (user?.name?.trim()?.[0] || 'A').toUpperCase()

  const doLogout = async () => {
    setOpen(false)
    try { await authApi.logout() } catch { /* revoke best-effort */ }
    logoutStore()
    navigate('/login', { replace: true })
  }

  const itemCls = 'flex w-full items-center gap-2 px-4 py-2 text-sm text-content hover:bg-accent-light'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-mid text-sm font-semibold text-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        {initial}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-56 overflow-hidden rounded-card border border-hairline bg-surface shadow-pop"
          >
            <div className="border-b border-hairline px-4 py-3">
              <p className="truncate text-sm font-semibold text-content">{user?.name || 'Account'}</p>
              <p className="truncate text-xs text-content-secondary">{user?.email || ''}</p>
            </div>
            <div className="py-1">
              {hasProfile && (
                <Link to={`${base}/profile`} role="menuitem" className={itemCls} onClick={() => setOpen(false)}>
                  <User className="h-4 w-4 text-content-secondary" /> Profile
                </Link>
              )}
              <Link to={`${base}/settings`} role="menuitem" className={itemCls} onClick={() => setOpen(false)}>
                <SettingsIcon className="h-4 w-4 text-content-secondary" /> Settings
              </Link>
            </div>
            <div className="border-t border-hairline py-1">
              <button type="button" role="menuitem" onClick={doLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/5">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// FIX 2 — global search (customers): debounced garages + services, results
// dropdown, Enter → pre-filtered Garages listing. Module-level component so the
// input never remounts (keeps focus while typing).
function GlobalSearch() {
  const role = useAuthStore((s) => s.user?.role)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(ref, open, () => setOpen(false))

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  const isCustomer = role === 'customer'
  const garages = useGarages(isCustomer)
  const popular = useQuery({ 
    queryKey: ['services', 'popular'], 
    queryFn: () => servicesApi.popular().then((d) => d.services),
    enabled: isCustomer
  })

  // Hooks must run unconditionally; only render for customers.
  if (!isCustomer) return null

  const term = debounced.toLowerCase()
  const active = term.length >= 2
  const garageMatches = active ? (garages.data || []).filter((g) => g.name.toLowerCase().includes(term) || (g.address || '').toLowerCase().includes(term)).slice(0, 5) : []
  const serviceMatches = active ? (popular.data || []).filter((s) => s.name.toLowerCase().includes(term)).slice(0, 5) : []
  const loading = active && (garages.isLoading || popular.isLoading)
  const noResults = active && !loading && garageMatches.length === 0 && serviceMatches.length === 0

  const go = (path) => { setOpen(false); setQ(''); navigate(path) }
  const submit = (e) => {
    e.preventDefault()
    if (!q.trim()) return
    go(`/customer/garages?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="relative mx-2 hidden w-full max-w-sm sm:block" ref={ref}>
      <form onSubmit={submit}>
        <Input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          leftIcon={<Search className="h-4 w-4" />}
          placeholder="Search garages & services"
          aria-label="Search garages and services"
        />
      </form>
      <AnimatePresence>
        {open && active && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-card border border-hairline bg-surface py-1 shadow-pop"
          >
            {loading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-content-secondary"><Loader2 className="h-4 w-4 animate-spin" /> Searching…</div>
            ) : noResults ? (
              <div className="px-4 py-4 text-sm text-content-muted">No results for “{debounced}”.</div>
            ) : (
              <>
                {garageMatches.length > 0 && (
                  <div>
                    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-content-muted">Garages</p>
                    {garageMatches.map((g) => (
                      <button key={g._id} type="button" onClick={() => go(`/customer/garages/${g._id}`)} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-content hover:bg-accent-light">
                        <Store className="h-4 w-4 text-content-secondary" /><span className="truncate">{g.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {serviceMatches.length > 0 && (
                  <div>
                    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-content-muted">Services</p>
                    {serviceMatches.map((s) => (
                      <button key={s._id} type="button" onClick={() => go(`/customer/garages/${s.garageId}`)} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-content hover:bg-accent-light">
                        <Wrench className="h-4 w-4 text-content-secondary" /><span className="truncate">{s.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button type="button" onClick={submit} className="mt-1 flex w-full items-center gap-2 border-t border-hairline px-4 py-2 text-left text-sm font-medium text-primary hover:bg-accent-light">
                  <Search className="h-4 w-4" /> See all results for “{q.trim()}”
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NavItems({ items, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1.5 px-2">
      {items.map(({ label, to, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-all duration-300',
              isActive
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-content-secondary hover:bg-black/5 hover:text-content hover:shadow-sm backdrop-blur-sm'
            )
          }
        >
          {({ isActive }) => (
            <>
              {/* Active Indicator */}
              <div 
                className={cn(
                  'absolute -left-2 top-1/2 h-3/5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-300',
                  isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                )} 
              />
              {Icon && (
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-transform duration-300", 
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} 
                />
              )}
              <span className="truncate">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

/**
 * Shared authenticated shell: fixed left sidebar on desktop, a top bar with
 * bell + avatar, and — on mobile — either a bottom-tab bar or a slide-out
 * drawer. Renders the animated <Outlet/> via PageTransition.
 */
export default function DashboardLayout({ navItems, mobileMode = 'drawer', bottomTabs }) {
  const [drawer, setDrawer] = useState(false)
  const location = useLocation()
  useEffect(() => setDrawer(false), [location.pathname])

  const tabs = bottomTabs || navItems.slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-hairline bg-surface md:flex">
        <div className="flex h-16 items-center px-5">
          <Link to="/">
            <img src="/autospa-logo-horizontal.svg" alt="AutoSpa" className="h-8 w-auto" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <NavItems items={navItems} />
        </div>
      </aside>

      <div className="flex-1 md:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-hairline bg-surface/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            {mobileMode === 'drawer' && (
              <button
                type="button"
                className="rounded-control p-2 text-content md:hidden"
                aria-label="Open menu"
                onClick={() => setDrawer(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link to="/" className="md:hidden">
              <img src="/autospa-logo-horizontal.svg" alt="AutoSpa" className="h-7 w-auto" />
            </Link>
          </div>

          {/* Global search (customers) */}
          <GlobalSearch />

          <div className="flex shrink-0 items-center gap-3">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>

        <main className={cn('p-4 sm:p-6', mobileMode === 'tabs' ? 'pb-24 md:pb-6' : '')}>
          <PageTransition />
        </main>
      </div>

      {/* Mobile drawer (garage/admin) */}
      {mobileMode === 'drawer' && (
        <AnimatePresence>
          {drawer && (
            <motion.div className="fixed inset-0 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-[var(--primary-deep)]/40" onClick={() => setDrawer(false)} />
              <motion.aside
                className="absolute left-0 top-0 flex h-full w-72 flex-col bg-surface p-4 shadow-pop"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
              >
                <div className="mb-4 flex items-center justify-between px-1">
                  <img src="/autospa-logo-horizontal.svg" alt="AutoSpa" className="h-8 w-auto" />
                  <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)}>
                    <X className="h-6 w-6 text-content" />
                  </button>
                </div>
                <NavItems items={navItems} onNavigate={() => setDrawer(false)} />
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile bottom tabs (customer) */}
      {mobileMode === 'tabs' && (
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-hairline bg-surface/95 backdrop-blur-md md:hidden">
          {tabs.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
                  isActive ? 'text-primary' : 'text-content-muted'
                )
              }
            >
              {Icon && <Icon className="h-5 w-5" />}
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
