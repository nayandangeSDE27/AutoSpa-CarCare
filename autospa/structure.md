# AutoSpa — Project Structure Guide

> A complete reference for every file used in the **client** and **server** folders.
> Each entry answers two questions: **What** does this file do? and **Why** does it exist?

---

## 📁 Root Level

| File | What | Why |
|------|------|-----|
| `package.json` | Root workspace package — declares workspaces for `client` and `server` | Allows running both apps from a single `npm` context (monorepo) |
| `docker-compose.yml` | Spins up MongoDB, Redis, and the server container together | One-command local infrastructure — no manual MongoDB/Redis setup needed |
| `.gitignore` | Tells Git which files/folders to never commit | Keeps `node_modules`, `.env` secrets, and build artifacts out of version control |
| `README.md` | High-level project overview and setup instructions | First document any developer reads; covers prerequisites, env setup, and run commands |
| `claude.md` | AI assistant context file with architecture notes | Helps AI tools understand the codebase conventions |

---

## 🖥️ CLIENT (`client/`)

The client is a **React + Vite** single-page application (SPA).

### Root Config Files

| File | What | Why |
|------|------|-----|
| `index.html` | The single HTML shell that React mounts into (`<div id="root">`) | Vite uses it as the entry template; the whole UI is injected here at runtime |
| `vite.config.js` | Vite bundler configuration (aliases, dev-server proxy, plugins) | Configures `@` path alias and proxies `/api` calls to the backend in development |
| `package.json` | Client dependencies — React, React Router, TanStack Query, Axios, etc. | Declares all frontend npm packages and scripts (`dev`, `build`, `preview`) |
| `tailwind.config.js` | Tailwind CSS configuration — custom colors, fonts, breakpoints | Extends the default theme to match AutoSpa design tokens |
| `postcss.config.js` | PostCSS plugin setup for Tailwind and Autoprefixer | Required by Tailwind to process CSS files through the PostCSS pipeline |
| `jsconfig.json` | JavaScript path aliases for VS Code IntelliSense | Mirrors `vite.config.js` aliases so the editor resolves `@/` imports correctly |
| `components.json` | shadcn/ui configuration — base color, CSS variables, component paths | Tells the shadcn CLI where to place generated UI components |
| `.env` / `.env.example` | Environment variables (`VITE_API_URL`, etc.) | `.env` holds local values; `.env.example` is the safe template committed to Git |

---

### `client/src/` — Application Source

#### Entry Points

| File | What | Why |
|------|------|-----|
| `main.jsx` | React DOM root — wraps `<App>` in `BrowserRouter`, `QueryProvider`, and `ToastHost` | The very first JS file Vite loads; bootstraps routing, data-fetching, and notifications |
| `App.jsx` | Top-level component — renders `<AppRoutes>` and `<RealtimeBridge>` | Keeps the root clean; separates routing from real-time socket setup |
| `index.css` | Global base styles — Tailwind directives + custom CSS variables | Applies design tokens (colors, spacing) and overrides across the entire app |

---

#### `src/api/` — HTTP Client Layer

All API calls go through a centralized Axios instance. Each file handles one domain.

| File | What | Why |
|------|------|-----|
| `client.js` | Creates the shared Axios instance with `baseURL`, `withCredentials` | Single source of truth for API base URL and cookie handling |
| `refreshInterceptor.js` | Axios response interceptor — silently refreshes the access token on 401 | Keeps the user logged in across tab reloads without manual re-login |
| `auth.api.js` | Login, register, logout, forgot/reset password, OTP calls | Isolates all auth HTTP logic from UI components |
| `bookings.api.js` | Create, list, cancel, and manage customer bookings | Domain-specific API functions keep components thin and testable |
| `cars.api.js` | CRUD for the customer's registered vehicles | Separates car management API from the rest |
| `garages.api.js` | Search, fetch, and manage garage data | Used by both customers (browsing) and garage owners (editing) |
| `services.api.js` | Fetch and manage services offered by a garage | Keeps service-management calls separate from other garage operations |
| `workers.api.js` | Manage garage staff/workers | Handles worker assignment API calls |
| `reviews.api.js` | Submit and fetch reviews for garages | Isolates review domain from booking/service logic |
| `wallet.api.js` | Wallet balance, top-up, and transaction history | Dedicated file for the wallet payment flow |
| `notifications.api.js` | Fetch and mark notifications as read | Keeps notification polling/clearing logic centralized |
| `users.api.js` | Get/update the logged-in user's profile | User profile API separate from auth login/logout |
| `dashboard.api.js` | Fetch dashboard statistics (admin or garage owner) | Dashboard-only aggregated API calls |
| `analytics.api.js` | Fetch analytics report data for garage owners | Separate from dashboard stats — more detailed chart data |
| `admin.api.js` | Admin-only actions — approve/suspend garages, manage users | Protected calls only admin role can make |
| `uploads.api.js` | Upload files (images, documents) to Cloudinary via the server | Wraps multipart/form-data file upload in a clean function |

---

#### `src/components/ui/` — Reusable UI Primitives

These are low-level components used throughout every page.

| File | What | Why |
|------|------|-----|
| `Button.jsx` | Styled button with variants (primary, ghost, danger) and loading state | Consistent buttons across the app; prevents per-page styling drift |
| `Input.jsx` | Form input with label, error message, and icon support | Standardizes form fields — validation errors always display the same way |
| `Modal.jsx` | Accessible dialog/modal with backdrop and close handlers | Reused for confirmations, forms, and detail views everywhere |
| `Card.jsx` | Wrapper with shadow, rounded corners, and padding | Visual grouping for dashboard tiles, garage cards, etc. |
| `Badge.jsx` | Small colored label for statuses (pending, active, cancelled) | Shows booking/garage status at a glance with consistent color coding |
| `Skeleton.jsx` | Loading placeholder animation (shimmer effect) | Prevents layout shift during data fetching; improves perceived performance |
| `Toast.jsx` | Global notification system — success, error, info toasts | Mounted once in `main.jsx`; triggered from anywhere via a helper function |
| `Stars.jsx` | Star rating display component | Used on review cards and garage detail pages |
| `StatCard.jsx` | A card that displays a single metric with an icon and trend | Used in admin and garage owner dashboards |
| `Stepper.jsx` | Multi-step progress indicator | Used in `BookingWizard` and `RegisterFlow` to show step position |
| `Tabs.jsx` | Tab navigation bar with active indicator | Used on profile, settings, and booking detail pages |
| `EmptyState.jsx` | Illustrated empty state with message and optional action button | Shown when a list has no items (no bookings, no cars, etc.) |

---

#### `src/pages/` — Page Components (by role)

##### `pages/public/` — Publicly accessible pages (no login required)

| File | What | Why |
|------|------|-----|
| `Home.jsx` | Landing page — hero, features, CTA sections | First page a visitor sees; drives conversions to sign up |
| `About.jsx` | Company/product about page | Builds trust and explains the platform |
| `Services.jsx` | Public listing of all service categories AutoSpa offers | SEO-friendly services showcase |
| `HowItWorks.jsx` | Step-by-step flow explanation for customers and garages | Reduces onboarding confusion |
| `Developer.jsx` | Developer/API info or contributor guide | Documents the platform for technical visitors |

##### `pages/auth/` — Authentication flow

| File | What | Why |
|------|------|-----|
| `AuthShell.jsx` | Shared layout wrapper (logo, card) for auth pages | Avoids repeating the same auth-page chrome on login/register/forgot |
| `Login.jsx` | Email + password login form | Entry point for returning users |
| `RegisterFlow.jsx` | Multi-step registration wizard (role selection then details) | Handles different paths for customer vs garage owner onboarding |
| `RegisterCustomer.jsx` | Triggers the customer registration path inside `RegisterFlow` | Role-specific entry wrapper |
| `RegisterGarage.jsx` | Triggers the garage registration path inside `RegisterFlow` | Role-specific entry wrapper |
| `ForgotPassword.jsx` | Email input to request a password-reset OTP | Starts the forgot-password flow |
| `ResetPassword.jsx` | OTP + new password form | Completes the password-reset flow |

##### `pages/customer/` — Customer portal (logged-in customers)

| File | What | Why |
|------|------|-----|
| `Dashboard.jsx` | Customer home — recent bookings, stats, quick actions | Central hub for a logged-in customer |
| `Garages.jsx` | Browse/search all available garages | Lets customers find a garage to book |
| `GarageDetails.jsx` | Detailed garage page — services, reviews, availability, book button | All info needed to make a booking decision |
| `BookingWizard.jsx` | Multi-step form: pick service, pick slot, confirm | Guides the customer through creating a booking step by step |
| `BookingSuccess.jsx` | Confirmation screen after a booking is created | Reassures the customer their booking was placed |
| `BookingHistory.jsx` | List of all past and upcoming bookings | Lets customers track their service history |
| `BookingDetails.jsx` | Full details for a single booking — status, invoice, actions | Deep-dive view; supports cancellation and review |
| `Cars.jsx` | List of the customer's registered vehicles | Manage cars attached to the account |
| `CarForm.jsx` | Add/edit a car form (make, model, year, plates, photo) | CRUD form for vehicle data |
| `Reviews.jsx` | Customer's submitted reviews | See and manage reviews they have written |
| `Notifications.jsx` | In-app notification inbox | View booking updates and system alerts |
| `Profile.jsx` | View and edit personal profile info | Update name, avatar, contact details |
| `Settings.jsx` | Account settings — password change, preferences | Non-profile settings (security, notifications opt-in) |

##### `pages/garage/` — Garage owner portal

| File | What | Why |
|------|------|-----|
| `Dashboard.jsx` | Garage owner home — bookings, revenue, workers overview | Central hub for today's operations |
| `Onboarding.jsx` | First-time setup wizard for a new garage owner | Walks through adding garage info and documents before going live |
| `EditGarage.jsx` | Edit garage profile — name, location, hours, images | Keeps garage info up to date |
| `Bookings.jsx` | List of all incoming/past bookings for the garage | Manage and track all customer bookings |
| `BookingDetails.jsx` | Full booking detail view for the owner — assign worker, update status | Operational view; owner controls the booking lifecycle |
| `Services.jsx` | Add, edit, and remove services with pricing and duration | Manage what the garage offers |
| `Workers.jsx` | Add and manage garage staff members | Assign workers to bookings |
| `Analytics.jsx` | Revenue charts, booking trends, service popularity | Data-driven insights for the garage owner |
| `Reviews.jsx` | See all customer reviews for the garage | Monitor reputation |
| `Wallet.jsx` | Wallet balance, payout history, top-up and withdraw | Financial overview — where earnings land |
| `Profile.jsx` | Garage owner's personal profile | Edit owner account details |
| `Settings.jsx` | Garage-level settings — notification prefs, payout config | Configure garage-specific preferences |

##### `pages/admin/` — Admin panel

| File | What | Why |
|------|------|-----|
| `Dashboard.jsx` | Platform-wide stats — total users, garages, revenue | Super-admin bird's-eye view |
| `Users.jsx` | List and manage all platform users | Suspend, ban, or inspect any user account |
| `Garages.jsx` | List and approve/reject garage applications | Controls which garages go live on the platform |
| `Bookings.jsx` | Platform-wide booking overview | Audit any booking across any garage |
| `Reports.jsx` | Revenue reports and analytics for the entire platform | Financial reporting for business decisions |
| `Settings.jsx` | Global platform settings — rate limits, maintenance mode | Admin-only config knobs |

##### `pages/` — Utility pages

| File | What | Why |
|------|------|-----|
| `NotFound.jsx` | 404 page | Friendly fallback for unknown routes |
| `PagePlaceholder.jsx` | Placeholder for pages under construction | Prevents crashes on unfinished routes |
| `Sandbox.jsx` | Developer sandbox / component playground | Lets developers preview UI components in isolation during development |

---

#### `src/layouts/` — Shared Page Layouts

| File | What | Why |
|------|------|-----|
| `PublicLayout.jsx` | Navbar + footer wrapper for public pages | Public visitors always get the same nav/footer chrome |
| `DashboardLayout.jsx` | Sidebar + topbar layout for all authenticated dashboards | Shared shell for customer, garage, and admin portals |
| `CustomerLayout.jsx` | Outlet wrapper that enforces the `customer` role | Guards the customer section of the dashboard |
| `GarageLayout.jsx` | Outlet wrapper that enforces the `garage_owner` role | Guards the garage owner section |
| `AdminLayout.jsx` | Outlet wrapper that enforces the `admin` role | Guards the admin panel |
| `PageTransition.jsx` | Framer Motion fade/slide animation between route changes | Smooth page transitions improve perceived performance |

---

#### `src/routes/` — Client-Side Routing

| File | What | Why |
|------|------|-----|
| `AppRoutes.jsx` | Defines the complete React Router route tree for all roles | Single place to see every URL in the app |
| `ProtectedRoute.jsx` | HOC that redirects unauthenticated users to `/login` | Prevents access to private pages without a valid session |
| `guards.js` | Role-checking helper functions used by `ProtectedRoute` | Keeps role-guard logic reusable and out of route definitions |

---

#### `src/hooks/` — Custom React Hooks

| File | What | Why |
|------|------|-----|
| `useAuthBootstrap.js` | On mount, fetches the current user and hydrates the auth store | Runs once at app start — restores the user session from the server |
| `useMe.js` | TanStack Query hook for the current user's profile | Re-fetches and caches `/api/users/me` for any component that needs user data |
| `useBookings.js` | Query hook for the customer's booking list | Centralizes booking data fetching and cache management |
| `useCars.js` | Query hook for the customer's vehicles | Provides `cars`, `isLoading`, `addCar`, `deleteCar` to components |
| `useGarages.js` | Query hook for the garage list with search/filter params | Handles pagination and filter state for the garage browser |
| `useGarageBookings.js` | Query hook for garage owner's bookings | Separate from customer bookings — different endpoint and data shape |
| `useOwner.js` | Query hook bundle for the garage owner portal | Combines garage profile, services, and workers into one hook |
| `useAdmin.js` | Query hooks for admin panel data | Aggregates platform stats, user list, and garage list for admin pages |
| `useReviews.js` | Query hook for fetching and submitting reviews | Handles review list + mutation (create, delete) |
| `usePayments.js` | Query hook for payment/wallet data | Fetches wallet balance and transaction history |
| `useNotifications.js` | Query hook for the notification inbox | Polls for new notifications and provides mark-as-read mutation |
| `useSocket.js` | Subscribes to Socket.IO events for a specific channel | Used by `RealtimeBridge` to handle live booking status updates |

---

#### `src/stores/` — Global Client State

| File | What | Why |
|------|------|-----|
| `auth.store.js` | Zustand store holding `user`, `isAuthenticated`, `setUser`, `logout` | Lightweight global state for the current user — avoids prop-drilling auth data |

---

#### `src/providers/` — React Context Providers

| File | What | Why |
|------|------|-----|
| `QueryProvider.jsx` | Wraps the app with TanStack Query's `QueryClientProvider` | Required by `useQuery` / `useMutation` — all server-state queries run through this |

---

#### `src/realtime/` — WebSocket / Real-Time

| File | What | Why |
|------|------|-----|
| `RealtimeBridge.jsx` | Connects to the Socket.IO server and subscribes to user-specific events | Pushes live booking updates and notifications to the UI without polling |

---

#### `src/lib/` — Shared Utilities

| File | What | Why |
|------|------|-----|
| `socket.js` | Creates and exports the singleton Socket.IO client instance | Single socket connection shared across the entire app |
| `format.js` | Date, currency, and string formatting helpers | Consistent display formatting (e.g., currency, dates) |
| `constants.js` | App-wide constant values (roles, booking statuses, etc.) | Magic strings defined once — changing a status name updates everywhere |
| `utils.js` | Misc utility functions (class name merging via `cn`, etc.) | Small helpers that do not belong to any specific domain |

---

## ⚙️ SERVER (`server/`)

The server is a **Node.js + Express** REST API backed by MongoDB (Mongoose) and Redis.

### Root Files

| File | What | Why |
|------|------|-----|
| `package.json` | Server dependencies — Express, Mongoose, Socket.IO, Stripe, etc. | Declares all backend npm packages and scripts |
| `.env` / `.env.example` | Server secrets (DB URI, JWT keys, Stripe keys, etc.) | `.env` holds real credentials; `.env.example` is the safe template for Git |

---

### `server/src/` — Application Source

#### Entry Points

| File | What | Why |
|------|------|-----|
| `server.js` | Production entry — connects DB, creates HTTP server, starts Socket.IO, begins cron | Separates I/O side-effects from the Express app so tests can import `app.js` cleanly |
| `app.js` | Builds the Express app — registers middleware, mounts routes, sets up error handlers | Pure function; contains no network calls, making it trivially testable |

---

#### `src/config/` — Configuration

| File | What | Why |
|------|------|-----|
| `index.js` | The only file that reads `process.env`; exports a typed `config` object | Single source of truth for all config; validates required env vars at startup and exits early if missing |
| `redis.js` | Creates and exports the Redis client (ioredis) | Centralized Redis connection used by auth tokens, OTP, and rate-limiting |
| `stripe.js` | Initializes and exports the Stripe SDK instance | Keeps the Stripe secret key in one place; used by `payment.service.js` |

---

#### `src/database/` — Database Connection

| File | What | Why |
|------|------|-----|
| `index.js` | Connects to MongoDB via Mongoose; retries on failure | Called once in `server.js` before the HTTP server starts |
| `createAdmin.js` | Script to create the initial admin user | Run once after first deployment — creates the super-admin account |

---

#### `src/models/` — Mongoose Schemas (Data Layer)

Each model file defines the shape of one MongoDB collection.

| File | What | Why |
|------|------|-----|
| `user.model.js` | Schema for customers, garage owners, and admins; stores hashed password | Core identity collection — all auth and profile operations use this |
| `garage.model.js` | Schema for garage profile — name, location, hours, approval status | Represents the service provider entity on the platform |
| `garageDocument.model.js` | Schema for uploaded verification documents (license, etc.) | Stored separately from the garage to keep the main schema lean |
| `service.model.js` | Schema for services a garage offers — name, price, duration | Each garage can have many services; linked by `garage` ref |
| `worker.model.js` | Schema for garage staff members | Workers are assigned to bookings |
| `car.model.js` | Schema for a customer's registered vehicle | A customer can own many cars; bookings reference a specific car |
| `booking.model.js` | Schema for a service booking — status machine, timestamps, references | Central operational document linking customer, garage, service, and car |
| `payment.model.js` | Schema for a Stripe payment linked to a booking | Auditable payment record separate from the booking itself |
| `wallet.model.js` | Schema for a garage owner's AutoSpa wallet | Holds balance; updated via wallet transactions |
| `walletTransaction.model.js` | Schema for each credit/debit entry in a wallet | Transaction log for audit and payout history |
| `review.model.js` | Schema for a customer review on a completed booking | One review per booking; aggregated into garage rating |
| `notification.model.js` | Schema for in-app notifications for any user | Persisted so users can see old notifications on re-login |
| `analyticsSnapshot.model.js` | Schema for pre-computed analytics data stored periodically | Avoids expensive aggregation on every analytics request |
| `counter.model.js` | Schema for auto-incrementing ID counters (e.g., booking number) | Provides human-readable IDs like `BOOK-0042` |
| `settings.model.js` | Schema for global platform settings (key-value store) | Admin-configurable settings that do not need a code deploy to change |

---

#### `src/repositories/` — Database Access Layer

Repositories are the **only** layer that touches Mongoose models directly. Services call repositories, not models.

| File | What | Why |
|------|------|-----|
| `user.repository.js` | findById, findByEmail, create, update for users | Decouples query logic from business logic; makes mocking in tests easy |
| `garage.repository.js` | CRUD and search queries for garages | Complex geo/filter queries isolated here |
| `garageDocument.repository.js` | Save and fetch garage verification documents | Keeps document queries separate |
| `service.repository.js` | CRUD for garage services | |
| `worker.repository.js` | CRUD for garage workers | |
| `car.repository.js` | CRUD for customer vehicles | |
| `booking.repository.js` | Create, find, update bookings; complex status queries | Most business-critical queries live here |
| `payment.repository.js` | Create and find payment records | |
| `wallet.repository.js` | Update balance, insert transactions, fetch history | Wallet mutation logic centralized here |
| `review.repository.js` | Create, list, and aggregate reviews for a garage | Includes average-rating aggregation |
| `notification.repository.js` | Create, list, and mark-read notifications | |
| `analytics.repository.js` | Aggregation queries for revenue, bookings, trends | Heavy MongoDB pipelines isolated here |
| `settings.repository.js` | Get and update platform settings key-value pairs | |

---

#### `src/services/` — Business Logic Layer

Services **orchestrate** — they call repositories, send emails, charge Stripe, etc. Controllers call services.

| File | What | Why |
|------|------|-----|
| `auth.service.js` | Register, login, logout, OTP generation/verify, token refresh | All auth business rules (rate limiting OTP resends, token rotation) in one place |
| `user.service.js` | Get and update user profile | Thin service — most complexity is in `auth.service.js` |
| `garage.service.js` | Create, update, approve/reject garages; upload documents | Orchestrates garage creation + Cloudinary + status transitions |
| `service.service.js` | Manage services within a garage | CRUD business rules for the services a garage offers |
| `worker.service.js` | Manage workers; assign to bookings | |
| `car.service.js` | Add, edit, delete customer vehicles | |
| `booking.service.js` | Create booking, cancel, status transitions, slot validation | Most complex service — coordinates slots, notifications, payments, and emails |
| `slot.service.js` | Generate available time slots for a garage on a given day | Slot-finding algorithm isolated from booking creation |
| `payment.service.js` | Create Stripe payment intent, handle webhook, record payment | All Stripe SDK calls go through here |
| `wallet.service.js` | Top up and debit garage owner wallet; payout flow | Atomic wallet mutations using MongoDB sessions |
| `review.service.js` | Submit review, enforce one-per-booking, update garage rating | Business rules for review eligibility |
| `notification.service.js` | Create and push notifications (DB + Socket.IO) | Centralizes notification creation so any service can trigger them |
| `invoice.service.js` | Generate PDF invoice for a completed booking | Calls `invoicePdf.js` util and emails it to the customer |
| `dashboard.service.js` | Aggregate stats for the garage owner dashboard | Converts raw DB counts into dashboard-ready numbers |
| `analytics.service.js` | Compute detailed analytics for the analytics page | Delegates to `analytics.repository.js` |
| `public.service.js` | Public-facing garage search and listing | No auth required; used by the public browse page |
| `admin.service.js` | Platform-wide admin operations | Approve garages, suspend users, fetch platform metrics |
| `settings.service.js` | Read/write global platform settings | |

---

#### `src/controllers/` — HTTP Request Handlers

Controllers are thin — they parse the request, call a service, and return a response.

| File | What | Why |
|------|------|-----|
| `auth.controller.js` | POST /register, /login, /logout, /refresh, /otp/* | Delegates all logic to `auth.service.js`; no business rules here |
| `user.controller.js` | GET/PATCH /users/me | Profile endpoints |
| `garage.controller.js` | CRUD for garages, document upload, approval | Garage management endpoints |
| `service.controller.js` | CRUD for services within a garage | |
| `worker.controller.js` | CRUD for workers | |
| `car.controller.js` | CRUD for customer vehicles | |
| `booking.controller.js` | Create, list, get, cancel, update-status bookings | |
| `payment.controller.js` | Create payment intent; handle Stripe webhook | The `webhook` export is mounted with raw body in `app.js` |
| `wallet.controller.js` | Wallet balance, top-up, and transaction history | |
| `review.controller.js` | Submit and list reviews | |
| `notification.controller.js` | List and mark-read notifications | |
| `dashboard.controller.js` | Dashboard stats endpoint | |
| `analytics.controller.js` | Analytics data endpoint | |
| `admin.controller.js` | Admin-only platform management endpoints | |
| `public.controller.js` | Public search and garage info (no auth) | |
| `upload.controller.js` | Handle file upload to Cloudinary | |

---

#### `src/routes/` — Express Router Definitions

Each file maps HTTP methods + URL paths to the correct middleware + controller.

| File | What | Why |
|------|------|-----|
| `index.js` | Aggregates all routers under `/api` prefix | Single mount point in `app.js` — clean and scalable |
| `auth.routes.js` | `/api/auth/*` — register, login, logout, OTP | |
| `user.routes.js` | `/api/users/*` — profile | |
| `garage.routes.js` | `/api/garages/*` — garage CRUD, documents, approval | |
| `service.routes.js` | `/api/services/*` — service management | |
| `worker.routes.js` | `/api/workers/*` — worker management | |
| `car.routes.js` | `/api/cars/*` — vehicle management | |
| `booking.routes.js` | `/api/bookings/*` — booking lifecycle | |
| `payment.routes.js` | `/api/payments/*` — Stripe payment intent | |
| `wallet.routes.js` | `/api/wallet/*` — wallet operations | |
| `review.routes.js` | `/api/reviews/*` — review submission | |
| `notification.routes.js` | `/api/notifications/*` — inbox | |
| `dashboard.routes.js` | `/api/dashboard/*` — stats | |
| `analytics.routes.js` | `/api/analytics/*` — charts | |
| `admin.routes.js` | `/api/admin/*` — admin panel actions | |
| `public.routes.js` | `/api/public/*` — unauthenticated browsing | |
| `upload.routes.js` | `/api/uploads/*` — file upload | |

---

#### `src/middlewares/` — Express Middleware

| File | What | Why |
|------|------|-----|
| `authenticate.js` | Verifies the JWT access token from the `Authorization` header | Protects all private routes — rejects requests without a valid token |
| `authorize.js` | Checks that the authenticated user has the required role | Role-based access control (`customer`, `garage_owner`, `admin`) |
| `validate.js` | Runs Zod schema validation on `req.body` / `req.params` | Rejects malformed requests before they reach the controller |
| `rateLimiter.js` | Express-rate-limit middleware — 100 req / 15 min per IP | Prevents brute-force and DDoS on the API |
| `upload.js` | Multer configuration for handling `multipart/form-data` file uploads | Stores files in memory before Cloudinary upload |
| `errorHandler.js` | Global error handler — formats `ApiError` instances into JSON responses | Centralizes error formatting so controllers just throw, not respond |
| `notFound.js` | Catches all unmatched routes and throws a 404 `ApiError` | Provides a clean JSON 404 instead of Express default HTML error |

---

#### `src/utils/` — Pure Utility Functions

| File | What | Why |
|------|------|-----|
| `ApiError.js` | Custom `Error` subclass with `statusCode` and `isOperational` flag | Typed errors that `errorHandler.js` can format correctly |
| `apiResponse.js` | `successResponse()` helper that sends a standardized JSON body | Every success response has the same `{ success, message, data }` shape |
| `asyncHandler.js` | Wraps async route handlers to auto-catch promise rejections | Eliminates try/catch boilerplate in every controller |
| `jwt.js` | `signAccessToken`, `signRefreshToken`, `verifyToken` helpers | Wraps jsonwebtoken with the config values — used by auth service and middleware |
| `cloudinary.js` | `uploadToCloudinary` and `deleteFromCloudinary` helpers | Abstracts the Cloudinary SDK so services do not import it directly |
| `mailer.js` | `sendMail()` using Nodemailer — falls back to console.log if SMTP not configured | Sends booking confirmations, OTPs, and invoices |
| `invoicePdf.js` | Generates a booking invoice PDF using PDFKit | Called by `invoice.service.js`; returns a Buffer attached to the email |
| `logger.js` | Winston logger instance (console in dev, file in prod) | Structured logging across the server |
| `time.js` | Time utility helpers — format duration, add hours, check overlap | Used by `slot.service.js` and `booking.service.js` |

---

#### `src/validators/` — Input Validation Schemas

Each file defines Zod schemas matched to a route domain.

| File | What | Why |
|------|------|-----|
| `auth.validator.js` | Schemas for register, login, OTP, reset-password bodies | Strong input validation at the API boundary |
| `user.validator.js` | Schema for updating user profile | |
| `garage.validator.js` | Schemas for creating/updating a garage | |
| `service.validator.js` | Schema for creating/updating a service | |
| `worker.validator.js` | Schema for adding/editing a worker | |
| `car.validator.js` | Schema for adding/editing a vehicle | |
| `booking.validator.js` | Schema for creating a booking (service, date, slot) | |
| `payment.validator.js` | Schema for creating a payment intent | |
| `wallet.validator.js` | Schema for wallet top-up request | |
| `review.validator.js` | Schema for submitting a review (rating, comment) | |
| `admin.validator.js` | Schemas for admin actions (approve garage, update settings) | |
| `common.validator.js` | Shared schemas reused across multiple validators (e.g., `objectId`) | Avoid duplicating ID/pagination validation in every file |

---

#### `src/realtime/` — WebSocket Layer (Socket.IO)

| File | What | Why |
|------|------|-----|
| `index.js` | Initializes Socket.IO on the HTTP server; handles connect/disconnect; emits events | Real-time booking status updates and notifications pushed to clients instantly |

---

#### `src/jobs/` — Background Jobs

| File | What | Why |
|------|------|-----|
| `scheduler.js` | Registers cron jobs using `node-cron` | Kicks off recurring tasks on a timer without a full job queue |
| `index.js` | Job implementations — booking reminders, analytics snapshot, cleanup | Reminder emails sent 24 h before appointments; stale data pruned automatically |

---

#### `src/scripts/` — One-Off Scripts (not part of the server runtime)

| File | What | Why |
|------|------|-----|
| `seed.js` | Seeds the database with demo garages, users, and bookings | Used in development/staging to populate the DB without manual data entry |

---

#### `src/logs/` — Runtime Log Files

Auto-generated by the Winston logger in production. Not committed to Git.

---

#### `src/uploads/` — Temporary Upload Directory

Used by Multer as the staging area before files are pushed to Cloudinary. Cleared automatically.

---

## Architecture Summary

```
Client (React/Vite)
  main.jsx -> App.jsx -> AppRoutes.jsx
    pages/* (role-based) -> hooks/* (useQuery) -> api/*.api.js -> Axios client.js
                                                            |
                                                     HTTPS REST API
                                                            |
Server (Express/Node)
  server.js -> app.js -> routes/index.js
    routes/*.routes.js -> middlewares -> controllers/* -> services/* -> repositories/* -> models/* (MongoDB)
                                                           |
                                              utils/* (JWT, mailer, Cloudinary, PDF)
                                              jobs/* (cron scheduler)

  realtime/index.js (Socket.IO) <-----> client/src/realtime/RealtimeBridge.jsx
```

**Data flow**: Client -> HTTP -> Route -> Middleware (auth/validate) -> Controller -> Service -> Repository -> MongoDB

**Real-time**: Server emits Socket.IO events -> RealtimeBridge.jsx updates Zustand/Query cache -> React re-renders
