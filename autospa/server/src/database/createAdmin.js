import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'

import User from '../models/user.model.js'

/*
 * One-off script to create (or promote) a single admin user.
 *
 * Usage:
 *   npm run create-admin
 *   npm run create-admin -- "Jane Admin" jane@site.com "SuperSecret123"
 *   ADMIN_EMAIL=jane@site.com ADMIN_PASSWORD=Secret123 npm run create-admin
 *
 * The password is set on the Mongoose model and saved via save(), so the
 * existing pre-save hook hashes it — never a plain-text password.
 */

// ---- Edit these fallbacks, or override via CLI args / env vars ----
const ADMIN = {
  name: process.env.ADMIN_NAME || process.argv[2] || 'Nayan Dange',
  email: process.env.ADMIN_EMAIL || process.argv[3] || 'adminnayan@gmail.com',
  password: process.env.ADMIN_PASSWORD || process.argv[4] || 'Admin@2003',
  phone: process.env.ADMIN_PHONE || '7389049902',
}

// Load the SAME env the app uses (server/.env) regardless of the current
// working directory, then read the app config for the Mongo URI.
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) })
const { default: config } = await import('../config/index.js')

async function main() {
  await mongoose.connect(config.mongoUri)
  console.log(`Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`)

  const email = ADMIN.email.trim().toLowerCase()
  const existing = await User.findOne({ email }).select('+password')

  let user
  if (existing) {
    existing.name = ADMIN.name
    existing.role = 'admin'
    existing.isEmailVerified = true
    existing.status = 'active'
    existing.password = ADMIN.password // re-hashed by the pre-save hook
    user = await existing.save()
    console.log(`↺ Existing user promoted to admin: ${user.email} (role: ${user.role})`)
  } else {
    user = await new User({
      name: ADMIN.name,
      email,
      phone: ADMIN.phone,
      password: ADMIN.password, // hashed by the pre-save hook
      role: 'admin',
      isEmailVerified: true,
      status: 'active',
    }).save()
    console.log(`✓ Admin created: ${user.email} (role: ${user.role})`)
  }

  // Verify it's actually persisted (password is never selected/returned).
  const check = await User.findById(user._id)
  console.log(
    `Verified in DB → id: ${check._id}, name: ${check.name}, email: ${check.email}, ` +
      `role: ${check.role}, verified: ${check.isEmailVerified}, status: ${check.status}`
  )
}

main()
  .catch((err) => {
    console.error('✗ Failed to create admin:', err.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {})
    process.exit(process.exitCode || 0)
  })
