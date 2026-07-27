import nodemailer from 'nodemailer'
import dns from 'node:dns'
import config from '../config/index.js'
import logger from './logger.js'

/**
 * Email utility. Uses a REAL nodemailer SMTP transport when SMTP_* env vars are
 * configured; otherwise falls back to a mock that logs (and, under test, records
 * to an in-process sink) so nothing breaks without credentials.
 */
let transport = null
const testSink = []

function getTransport() {
  if (transport) return transport
  if (config.smtp.enabled) {
    dns.lookup(config.smtp.host, { all: true }, (err, addresses) => {
      logger.info({ addresses, err }, 'SMTP DNS Lookup')
    })

    transport = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })
  }
  return transport
}

async function send({ to, subject, text = '', html }) {
  if (config.env === 'test') testSink.push({ to, subject, text })

  if (!config.smtp.enabled) {
    // Mock fallback — no credentials configured.
    logger.info(`[mailer:mock] to=${to} subject="${subject}"`)
    return { mocked: true, to, subject }
  }

  const info = await getTransport().sendMail({
    from: config.smtp.from,
    to,
    subject,
    text,
    html,
  })
  return { mocked: false, messageId: info.messageId }
}

export function getMailSink() {
  return testSink
}
export function clearMailSink() {
  testSink.length = 0
}

export default { send, getMailSink, clearMailSink }
