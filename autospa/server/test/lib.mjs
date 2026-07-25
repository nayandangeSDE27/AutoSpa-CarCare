/**
 * Tiny test helpers: an API client bound to a base URL, plus a results
 * collector with PASS/FAIL logging.
 */
export function makeClient(baseUrl) {
  return async function req(method, path, { token, body } = {}) {
    const canHaveBody = method !== 'GET' && method !== 'HEAD'
    const res = await fetch(baseUrl + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body && canHaveBody ? { body: JSON.stringify(body) } : {}),
    })
    let json = null
    try {
      json = await res.json()
    } catch {
      /* no body */
    }
    return { status: res.status, json }
  }
}

export function makeResults() {
  const state = { pass: 0, fail: 0 }
  return {
    state,
    section: (t) => console.log(`\n────────── ${t} ──────────`),
    log: (m) => console.log('  ' + m),
    ok(label, cond, extra = '') {
      if (cond) {
        console.log(`  ✅ PASS: ${label}`)
        state.pass++
      } else {
        console.log(`  ❌ FAIL: ${label} ${extra}`)
        state.fail++
      }
    },
  }
}
