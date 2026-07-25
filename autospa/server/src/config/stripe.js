import Stripe from 'stripe'

import config from './index.js'

/**
 * Stripe client. Null when STRIPE_SECRET_KEY isn't configured — callers must
 * handle that (create-order returns a clear error; the webhook is only used
 * with a real key). Tests exercise the payment SERVICE directly, bypassing the
 * network and signature verification.
 */
const stripe = config.stripe.enabled ? new Stripe(config.stripe.secretKey) : null

export default stripe
