/**
 * In-memory test runner.
 *   node test/run.mjs regression   -> auth + phase3 regression only (stop-first)
 *   node test/run.mjs phase4       -> phase 4 suite only
 *   node test/run.mjs all          -> everything (default)
 */
import { startHarness } from './harness.mjs'
import { makeClient, makeResults } from './lib.mjs'
import { runRegression } from './regression.mjs'

const suites = process.argv.slice(2)
const wants = (name) => suites.length === 0 || suites.includes('all') || suites.includes(name)

const harness = await startHarness()
const req = makeClient(harness.baseUrl)
const results = makeResults()
const ctx = {
  req,
  redis: harness.redis,
  baseUrl: harness.baseUrl,
  realtime: harness.realtime,
  mailer: harness.mailer,
  ...results,
}

let crashed = false
try {
  if (wants('regression')) {
    await harness.resetDb()
    await runRegression(ctx)
  }
  if (wants('phase4')) {
    await harness.resetDb()
    const { runPhase4 } = await import('./phase4.mjs')
    await runPhase4(ctx)
  }
  if (wants('phase5')) {
    await harness.resetDb()
    const { runPhase5 } = await import('./phase5.mjs')
    await runPhase5(ctx)
  }
  if (wants('phase6')) {
    await harness.resetDb()
    const { runPhase6 } = await import('./phase6.mjs')
    await runPhase6(ctx)
  }
} catch (e) {
  crashed = true
  console.error('\n💥 test run crashed:', e)
} finally {
  ctx.section('SUMMARY')
  console.log(`  PASSED: ${results.state.pass}    FAILED: ${results.state.fail}`)
  console.log(!crashed && results.state.fail === 0 ? '  RESULT: ✅ ALL PASS' : '  RESULT: ❌ FAILURES PRESENT')
  await harness.stop()
  process.exit(!crashed && results.state.fail === 0 ? 0 : 1)
}
