import Settings from '../models/settings.model.js'

/**
 * settingsRepository — the ONLY module that touches the Settings model.
 */

// Get the global settings doc, creating it with defaults if absent.
function getOrCreate() {
  return Settings.findOneAndUpdate(
    { key: 'global' },
    { $setOnInsert: { key: 'global', commissionRate: 0.1 } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  )
}

function update(patch) {
  return Settings.findOneAndUpdate({ key: 'global' }, patch, {
    returnDocument: 'after',
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  })
}

export default { getOrCreate, update }
