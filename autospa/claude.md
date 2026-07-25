Read CLAUDE.md fully. JavaScript / ES modules only. Follow the layered 
architecture (Route → Middleware → Controller → Service → Repository → 
MongoDB) and the exact API response shape from section 3.

STOP-FIRST CHECK: Before writing anything, confirm the Phase 1b foundation 
works. Run the server and confirm it connects to MongoDB and GET 
/api/health returns the standard response. If it does NOT connect or the 
health check fails, STOP and tell me what's broken — do not build auth on 
a broken foundation.

This is Phase 2 — AUTHENTICATION (backend only, no frontend yet). Build 
ONLY auth. Do not build cars, garages, bookings, or any other feature.

=== DATA MODEL ===
Create ONLY the Users model now (per CLAUDE.md section 7):
name, email (unique), phone, password (hashed, NEVER returned in any 
response), role ('customer'|'garage_owner'|'admin'), avatar, 
isEmailVerified (bool, default false), status ('active'|'blocked', 
default 'active'). Enable { timestamps: true }. Hash password with 
bcryptjs in a pre-save hook. Add an instance method to compare passwords. 
Ensure password is excluded by default (select: false) and never 
serialized.

=== AUTH STRATEGY (two-token) ===
- Access token: JWT signed with JWT_ACCESS_SECRET, short expiry (15m). 
  Payload: userId + role.
- Refresh token: JWT signed with JWT_REFRESH_SECRET, long expiry (7d). 
  Store the active refresh token in REDIS keyed by userId (with TTL 
  matching expiry) so it can be revoked on logout. Use ioredis.
- Email verification OTP: a 6-digit code stored in REDIS with a short TTL 
  (e.g. 10 min), keyed by userId/email. Do NOT store OTP in MongoDB.

=== ENDPOINTS (per CLAUDE.md API list) ===
POST /api/auth/register/customer   -> create user role=customer, generate 
                                      OTP, (log the OTP to console for now 
                                      instead of sending email)
POST /api/auth/register/garage     -> create user role=garage_owner, same 
                                      OTP flow
POST /api/auth/verify-email        -> verify OTP from Redis, set 
                                      isEmailVerified=true
POST /api/auth/resend-otp          -> regenerate + reset OTP TTL
POST /api/auth/login               -> validate credentials, block if 
                                      status='blocked', issue access + 
                                      refresh tokens
POST /api/auth/logout              -> revoke refresh token from Redis
POST /api/auth/refresh-token       -> verify refresh token against Redis, 
                                      issue a new access token
POST /api/auth/forgot-password     -> generate reset OTP/token in Redis 
                                      (log to console for now)
POST /api/auth/reset-password      -> verify reset token, set new password
GET  /api/auth/me                  -> return current user (protected)

=== LAYERS (keep strictly separated) ===
- validators/  : Zod schemas for every endpoint body. Reject invalid input 
  with the standard error response.
- repositories/: userRepository — the ONLY place touching the User model 
  (findByEmail, create, updateById, etc.).
- services/    : authService — ALL logic (hashing orchestration, token 
  issue/verify, OTP generate/verify via Redis, business rules). Calls 
  repository + Redis. No req/res here.
- controllers/ : authController — parse request, call service, format 
  response. No logic.
- routes/      : auth routes, wired with validation middleware.

=== MIDDLEWARE ===
- authenticate: verify access token, attach req.user (id, role). Reject 
  with standard 401 response if missing/invalid.
- authorize(...roles): RBAC — allow only listed roles, else standard 403. 
  This will guard customer/garage/admin routes in later phases.
- Wire request-validation middleware that runs the Zod validator for each 
  route.

=== CONFIG ===
Add any new env vars to config validation and .env.example 
(JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY, OTP_TTL, etc.). Redis connection 
via REDIS_URL in config/.

Do NOT build the frontend, and do NOT build other features. When done:
1. Show me the new files created and where they sit in the layers.
2. Give me exact curl commands (or a request sequence) to test: register 
   -> read OTP from console -> verify-email -> login -> call /auth/me with 
   the token -> refresh-token -> logout.
3. Remind me which env vars I must set before running.