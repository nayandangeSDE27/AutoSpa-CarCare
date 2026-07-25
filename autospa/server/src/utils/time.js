/**
 * Time helpers for slot generation. All times are handled in UTC so slot math
 * is deterministic regardless of server timezone. "HH:mm" strings in a garage's
 * workingHours are treated as UTC wall-clock for this dev build.
 */

// "09:30" -> 570 (minutes since midnight)
export function parseHHMM(value) {
  const [h, m] = String(value).split(':').map(Number)
  return h * 60 + m
}

// UTC midnight of a "YYYY-MM-DD" date.
export function dayStartUtc(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`)
}

// A Date at `minutes` past UTC midnight of the given date.
export function atMinutesUtc(dateStr, minutes) {
  return new Date(dayStartUtc(dateStr).getTime() + minutes * 60_000)
}

// 0 = Sunday … 6 = Saturday, in UTC.
export function weekdayUtc(dateStr) {
  return dayStartUtc(dateStr).getUTCDay()
}
