# AutoSpa

Car-wash / garage booking platform. Monorepo (npm workspaces).

- `client/` — React 19 + Vite (JavaScript/JSX), Tailwind + shadcn/ui *(scaffold; frontend not built yet)*
- `server/` — Node.js + Express (ES modules), MongoDB (Mongoose), Redis, Socket.IO, Stripe

Backend is complete through **Phase 6 (production layer)**: auth, customer features, garage-owner features, admin, payments/wallet, realtime + notifications, background jobs, PDF invoices and analytics. Architecture is strictly layered: **Route → Middleware → Controller → Service → Repository → MongoDB**, with a single response shape `{ success, message, data, errors }`.

---

## Quick start (local dev)

### 1. Prerequisites
- Node.js 18+
- Docker Desktop (for local MongoDB + Redis), **or** your own Mongo/Redis.
- MongoDB must run as a **replica set** — the booking/payment flows use multi-document transactions. The bundled `docker-compose.yml` already configures a single-node replica set (`rs0`).

### 2. Install
```bash
npm install
```

### 3. Start infrastructure (Mongo replica set + Redis)
```bash
npm run db:up      # docker compose up -d
npm run db:down    # stop when finished (data volume kept; add -v to wipe)
```

### 4. Configure env
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```
Fill in `server/.env`. The **required** vars fail-fast on boot if missing:
`MONGO_URI`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
Everything else (Stripe, Cloudinary, SMTP) is **optional** and degrades to a mock/console fallback so you can develop without third-party accounts.

### 5. Seed dummy data (optional)
```bash
npm run seed --workspace server
```

### 6. Run
```bash
npm run dev:server     # http://localhost:5000  (health: /api/health)
npm run dev            # client + server together
```

---

## Testing

All internal logic is tested against an **in-memory MongoDB replica set** (`mongodb-memory-server`) and a **mock Redis** (`ioredis-mock`) — no Docker, no credentials, nothing written to `.env`. Stripe is exercised at the service layer with a synthetic webhook event (no network).

```bash
npm test --workspace server            # full suite (119 checks, phases 2–6)
npm run test:regression --workspace server
npm run test:phase4 --workspace server
npm run test:phase5 --workspace server
npm run test:phase6 --workspace server
```

---

## Environment variables

| Var | Required | Purpose |
|---|---|---|
| `MONGO_URI` | ✅ | Mongo connection (replica set; keep `?directConnection=true` for a single-node local RS) |
| `REDIS_URL` | ✅ | Redis (refresh tokens, OTPs) |
| `JWT_ACCESS_SECRET` | ✅ | Signs 15-min access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Signs 7-day refresh tokens |
| `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY` | — | Token lifetimes (default `15m` / `7d`) |
| `OTP_TTL` | — | OTP validity seconds (default `600`) |
| `PORT` / `CLIENT_URL` / `NODE_ENV` | — | Server basics |
| `STRIPE_SECRET_KEY` | for payments | Stripe secret (`sk_test_…`). Absent → `create-order` returns 503 |
| `STRIPE_WEBHOOK_SECRET` | for payments | Verifies webhook signatures (`whsec_…`) |
| `STRIPE_CURRENCY` | — | Default `usd` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | for real uploads | Absent → uploads return deterministic **mock URLs** |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | for real email | Absent → OTP/email is **logged to console** |
| `REMINDER_LEAD_HOURS` | — | Booking-reminder lead time (default `24`) |

---

## Going live — exact steps on your machine

### A. Real MongoDB + Redis
- **Mongo must be a replica set** (Atlas already is; self-hosted needs `--replSet`). Set `MONGO_URI` to your cluster string (Atlas URIs enable transactions automatically — drop `directConnection`).
- Set `REDIS_URL` to your managed Redis.

### B. Stripe (test keys first)
1. Create a Stripe account → **Developers → API keys** → copy the **test** secret key into `STRIPE_SECRET_KEY`.
2. Install the Stripe CLI: `brew install stripe/stripe-cli/stripe` (macOS) then `stripe login`.
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```
   The CLI prints a signing secret like `whsec_…` — put it in `STRIPE_WEBHOOK_SECRET` and restart the server.
4. Trigger a test event to verify the flow end-to-end:
   ```bash
   stripe trigger payment_intent.succeeded
   ```
   (In the real app flow: the client confirms the PaymentIntent from `create-order`'s `clientSecret`; Stripe then calls the webhook, which is the **only** thing that flips a booking to `PAID`, computes commission, and credits the garage wallet — idempotently.)

### C. Cloudinary (image uploads)
- Create a Cloudinary account → copy **Cloud name / API key / API secret** into the three `CLOUDINARY_*` vars. Without them, gallery/after-image uploads return mock URLs.

### D. SMTP (email)
- Provide `SMTP_HOST/PORT/USER/PASS/FROM` (e.g. a transactional provider). Without them, OTPs are logged to the server console.

### E. Start everything
```bash
npm run db:up                     # or point env at managed Mongo/Redis instead
npm run dev:server                # or: npm start --workspace server (production)
stripe listen --forward-to localhost:5000/api/payments/webhook   # dev webhook forwarding
```

> Never trust the frontend to confirm payment — only the Stripe **webhook** marks a booking `PAID`.

---

## API surface (backend)

- **Auth** `/api/auth/*` — register/verify/login/refresh/logout, forgot/reset password, `me`
- **Customer** `/api/cars`, `/api/garages` (+ `/nearby`, `/featured`, `/:id/slots`), `/api/services`, `/api/bookings`
- **Garage owner** `/api/garages` (create/edit/gallery/documents), `/api/services`, `/api/workers`, booking state machine (`/status`, `/assign-worker`, `/start`, `/complete`), `/api/wallet`, `/api/dashboard/garage`, `/api/analytics/garage`
- **Admin** `/api/admin/*` (garages, users, bookings, reports, settings), `/api/dashboard/admin`, `/api/analytics/admin`
- **Payments** `/api/payments/create-order`, `/api/payments/webhook` (raw body), `/api/payments/history`, `/api/payments/:id`
- **Notifications** `/api/notifications` (+ `/:id/read`, `/read-all`, `DELETE /:id`)
- **Invoices** `GET /api/bookings/:id/invoice` (PDF, paid bookings)
- **Public (no auth)** `/api/stats/public`, `/api/reviews/testimonials`
- **Realtime** Socket.IO with JWT auth; per-user rooms; events emitted from the service layer

Background jobs (node-cron): booking reminders, daily analytics rollup, expired-refresh-token cleanup, completed-booking follow-ups.
