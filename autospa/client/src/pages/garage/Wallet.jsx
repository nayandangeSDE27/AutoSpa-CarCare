import { useState } from 'react'
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Plus, Info, AlertTriangle, CreditCard, Banknote, History, RefreshCcw, HandCoins, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { cn } from '../../lib/utils.js'
import { currency, formatDate } from '../../lib/format.js'
import { useWallet, useWalletTransactions, useTopup } from '../../hooks/useOwner.js'
import { Badge } from '../../components/ui/Badge.jsx'

function FadeUp({ children, delay = 0, className }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  )
}

function StatCard({ title, amount, icon: Icon, delay }) {
  return (
    <FadeUp delay={delay} className="h-full">
      <Card className="p-6 h-full rounded-[1.5rem] border-hairline shadow-sm hover:shadow-card hover:scale-[1.02] transition-all bg-surface">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-accent-light text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-[13px] font-bold uppercase tracking-widest text-content-muted mb-1">{title}</p>
        <p className="tabular text-2xl font-extrabold text-content tracking-tight">{currency(amount)}</p>
      </Card>
    </FadeUp>
  )
}

export default function Wallet() {
  const wallet = useWallet()
  const tx = useWalletTransactions()
  const topup = useTopup()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [preset, setPreset] = useState(null)

  const items = tx.data?.items || []
  const balance = wallet.data?.balance ?? 0
  const isNegative = balance < 0

  const submit = async () => {
    const n = Number(amount)
    if (!n || n <= 0) return
    await topup.mutateAsync(n).then(() => { setOpen(false); setAmount(''); setPreset(null); tx.refetch() }).catch(() => {})
  }

  const selectPreset = (val) => {
    setPreset(val)
    setAmount(val.toString())
  }

  // Mock metrics based on balance to make the UI look premium (as requested)
  const outstandingCommission = isNegative ? Math.abs(balance) : 0
  const todayCash = 2450
  const onlineEarnings = 1200
  const pendingAdjustments = 150

  return (
    <div className="mx-auto max-w-5xl pb-12">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-content tracking-tight mb-2">AutoSpa Wallet</h1>
        <p className="text-content-secondary font-medium">Manage your platform accounting and commission settlements.</p>
      </div>

      {/* Wallet Information Banner */}
      <FadeUp delay={0.1}>
        <div className="mb-8 flex gap-3 p-4 rounded-[1.25rem] bg-accent-light/50 border border-hairline shadow-sm">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-content-secondary leading-relaxed">
            <span className="font-bold text-content">Accounting Only:</span> This wallet is strictly used for platform commission adjustments. When customers pay you directly in cash, the platform commission is deducted from this balance. Recharge your wallet to clear negative balances and continue receiving booking requests.
          </p>
        </div>
      </FadeUp>

      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 mb-8">
        {/* Main Balance Hero */}
        <div className="lg:col-span-8">
          <FadeUp delay={0.2} className="h-full">
            {wallet.isLoading ? <Skeleton className="h-full min-h-[16rem] rounded-[2rem]" /> : (
              <Card className={cn(
                'relative overflow-hidden h-full p-8 rounded-[2rem] border-hairline shadow-card flex flex-col justify-between transition-colors duration-500', 
                isNegative ? 'bg-gradient-to-br from-danger/10 to-danger/5 border-danger/20' : 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'
              )}>
                {/* Background decorative elements */}
                <div className={cn("absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none", isNegative ? "bg-danger" : "bg-primary")} />
                
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border",
                      isNegative ? "bg-danger/10 text-danger border-danger/20" : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      {isNegative ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      {isNegative ? 'Negative Balance' : 'Healthy Status'}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-content-secondary uppercase tracking-widest mb-2">Current Balance</p>
                    <p className={cn("tabular text-5xl md:text-6xl font-extrabold tracking-tighter", isNegative ? "text-danger" : "text-content")}>
                      {currency(balance)}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm font-medium text-content-muted">
                    Last updated: Just now
                  </div>
                  {!isNegative && (
                    <Button onClick={() => setOpen(true)} className="rounded-xl h-12 px-6 shadow-md hover:shadow-lg hover:scale-105 transition-all">
                      <Plus className="h-5 w-5 mr-2" /> Recharge Wallet
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </FadeUp>
        </div>

        {/* Warning / Call to Action Card (if negative) */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            {isNegative ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full">
                <Card className="h-full p-6 rounded-[2rem] border-danger bg-danger text-white shadow-card flex flex-col justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  
                  <AlertTriangle className="h-12 w-12 text-white/90 mx-auto mb-4" />
                  <h3 className="text-xl font-extrabold tracking-tight mb-2">Outstanding Commission</h3>
                  <p className="text-sm font-medium text-white/80 mb-6 px-2 leading-relaxed">
                    Your balance is negative. Please recharge your wallet to clear outstanding commissions and continue accepting new bookings.
                  </p>
                  <Button variant="secondary" onClick={() => setOpen(true)} className="w-full rounded-xl h-12 shadow-lg bg-white text-danger hover:bg-white/90 font-bold border-none">
                    Recharge Now
                  </Button>
                </Card>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full">
                <Card className="h-full p-6 rounded-[2rem] border-hairline bg-surface shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-accent-light flex items-center justify-center mb-4">
                    <HandCoins className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-[15px] font-extrabold text-content mb-2">AutoSpa Accounting</h3>
                  <p className="text-xs font-medium text-content-secondary leading-relaxed px-4">
                    We only deduct commission for cash bookings. Online payments are settled automatically.
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        <StatCard title="Pending Dues" amount={outstandingCommission} icon={AlertTriangle} delay={0.3} />
        <StatCard title="Cash (Today)" amount={todayCash} icon={Banknote} delay={0.4} />
        <StatCard title="Online (Today)" amount={onlineEarnings} icon={CreditCard} delay={0.5} />
        <StatCard title="Adjustments" amount={pendingAdjustments} icon={RefreshCcw} delay={0.6} />
      </div>

      {/* Transactions Timeline */}
      <FadeUp delay={0.7}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-content tracking-tight">Transaction History</h2>
          <div className="text-sm font-bold text-content-muted bg-surface px-3 py-1.5 rounded-lg border border-hairline">
            Recent Activity
          </div>
        </div>

        {tx.isLoading ? <Skeleton className="h-64 rounded-[2rem]" /> : !items.length ? (
          <EmptyState icon={History} title="No transactions yet" description="Recharges and commission deductions will appear here." />
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-hairline before:to-transparent">
            {items.map((t, i) => (
              <motion.div 
                key={t._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 * i }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Center dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-surface shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-3 md:ml-0 z-10 transition-colors">
                  {t.type === 'CREDIT' ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-danger" />}
                </div>

                {/* Card */}
                <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-[1.5rem] border-hairline shadow-sm hover:shadow-card transition-all bg-surface">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={cn("px-2 py-0.5 text-[10px] uppercase font-bold", t.type === 'CREDIT' ? "bg-green-500/10 text-green-600" : "bg-danger/10 text-danger")}>
                        {t.type === 'CREDIT' ? 'Recharge / Refund' : 'Commission Deduction'}
                      </Badge>
                    </div>
                    <span className="text-xs font-semibold text-content-muted">{formatDate(t.createdAt)}</span>
                  </div>
                  
                  <h4 className="font-bold text-content text-[15px] mb-1">{t.description || (t.type === 'CREDIT' ? 'Wallet Recharge' : 'Platform Fee')}</h4>
                  <div className="flex justify-between items-end mt-4 pt-4 border-t border-hairline/60">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-content-muted mb-0.5">Ref ID</p>
                      <p className="text-xs font-mono text-content-secondary">TXN-{t._id ? t._id.toString().substring(0, 8).toUpperCase() : 'UNKNOWN'}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-lg font-extrabold tabular tracking-tight", t.type === 'CREDIT' ? "text-green-600" : "text-danger")}>
                        {t.type === 'CREDIT' ? '+' : '-'}{currency(t.amount)}
                      </p>
                      <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest mt-0.5">Balance: {currency(t.balanceAfterTransaction)}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </FadeUp>

      {/* Recharge Modal */}
      <Modal open={open} onClose={() => { setOpen(false); setPreset(null); setAmount('') }} title="Recharge Wallet"
        footer={
          <div className="flex gap-3 w-full mt-2">
            <Button variant="secondary" className="flex-1 rounded-xl h-12 shadow-sm bg-background border-hairline hover:bg-accent-light" onClick={() => { setOpen(false); setPreset(null); setAmount('') }}>Cancel</Button>
            <Button className="flex-[2] rounded-xl h-12 shadow-md hover:shadow-lg" loading={topup.isPending} disabled={!amount || Number(amount) <= 0} onClick={submit}>
              Continue to Payment
            </Button>
          </div>
        }>
        <div className="space-y-6 pt-2">
          
          <div className="bg-accent-light/50 p-4 rounded-xl border border-hairline">
            <p className="text-[13px] font-medium text-content-secondary leading-relaxed">
              Select an amount to recharge your wallet. This balance will be used to automatically settle platform commissions for future cash bookings.
            </p>
          </div>

          <div>
            <label className="mb-3 block text-sm font-extrabold text-content">Quick Select</label>
            <div className="grid grid-cols-3 gap-3">
              {[500, 1000, 2000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => selectPreset(val)}
                  className={cn(
                    "h-12 rounded-xl text-sm font-extrabold transition-all duration-300 shadow-sm border tabular",
                    preset === val || amount === val.toString()
                      ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 scale-105" 
                      : "bg-surface text-content border-control hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {currency(val)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-extrabold text-content">Custom Amount</label>
            <Input 
              type="number" 
              value={amount} 
              onChange={(e) => { setAmount(e.target.value); setPreset(null) }} 
              placeholder="e.g. 1500" 
              className="h-14 text-lg font-bold rounded-xl bg-surface tabular"
              leftIcon={<span className="text-content font-bold px-1">₹</span>}
            />
          </div>

        </div>
      </Modal>
    </div>
  )
}
