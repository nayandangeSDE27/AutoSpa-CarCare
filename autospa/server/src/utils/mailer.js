import { BrevoClient } from '@getbrevo/brevo'
import config from '../config/index.js'
import logger from './logger.js'

/**
 * Email utility. Uses the official Brevo SDK when BREVO_* env vars are
 * configured; otherwise falls back to a mock that logs (and, under test, records
 * to an in-process sink) so nothing breaks without credentials.
 */
let brevoClient = null
const testSink = []

function getBrevoClient() {
  if (brevoClient) return brevoClient
  if (config.brevo.enabled) {
    brevoClient = new BrevoClient({
      apiKey: config.brevo.apiKey
    })
  }
  return brevoClient
}

async function send({ to, subject, text = '', html }) {
  if (config.env === 'test') testSink.push({ to, subject, text })

  if (!config.brevo.enabled) {
    // Mock fallback — no credentials configured.
    logger.info(`[mailer:mock] to=${to} subject="${subject}"`)
    return { mocked: true, to, subject }
  }

  const payload = {
    sender: { name: config.brevo.fromName, email: config.brevo.fromEmail },
    to: [{ email: to }],
    subject,
  }
  
  if (text) payload.textContent = text
  if (html) payload.htmlContent = html

  try {
    const data = await getBrevoClient().transactionalEmails.sendTransacEmail(payload)
    return { mocked: false, messageId: data?.messageId }
  } catch (error) {
    logger.error({ err: error }, 'Brevo email send failed')
    throw error
  }
}

export function getMailSink() {
  return testSink
}
export function clearMailSink() {
  testSink.length = 0
}

export default { send, getMailSink, clearMailSink }
