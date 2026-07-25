/**
 * Dependency-injected response-error handler for the Axios instance. Kept
 * separate (and browser-free) so the refresh-once-and-retry / no-infinite-loop
 * behaviour can be unit-tested without a real browser or axios instance.
 */

/** Normalize any Axios error into { message, errors, status }. */
export function normalizeError(error) {
  const data = error?.response?.data
  const err = new Error(data?.message || error?.message || 'Something went wrong')
  err.errors = data?.errors || []
  err.status = error?.response?.status ?? null
  return err
}

/**
 * @param {object} deps
 * @param {(config:object)=>Promise<any>} deps.retry   re-issue the original request
 * @param {()=>Promise<string>} deps.refresh           returns a fresh access token (throws if it can't)
 * @param {()=>void} deps.onAuthFail                    clear auth + redirect to /login
 */
export function createResponseErrorHandler({ retry, refresh, onAuthFail }) {
  return async function onError(error) {
    const original = error?.config || {}
    const status = error?.response?.status
    const isRefreshCall = (original.url || '').includes('/auth/refresh-token')
    const isLoginCall = (original.url || '').includes('/auth/login')

    // Only try to refresh once per request, and never for the refresh call
    // itself (that would loop). Also don't attempt refresh if login fails.
    if (status === 401 && !original._retry && !isRefreshCall && !isLoginCall) {
      original._retry = true
      try {
        const token = await refresh()
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` }
        return await retry(original)
      } catch {
        onAuthFail()
        throw normalizeError(error)
      }
    }

    throw normalizeError(error)
  }
}
