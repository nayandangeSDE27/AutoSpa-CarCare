import Settings from '../models/settings.model.js'

/**
 * settingsRepository — the ONLY module that touches the Settings model.
 */

// Get the global settings doc, creating it with defaults if absent.
function getOrCreate() {
  return Settings.findOneAndUpdate(
    { key: 'global' },
    { $setOnInsert: { key: 'global', commissionRate: 0.1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
}

function update(patch) {
  return Settings.findOneAndUpdate({ key: 'global' }, patch, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  })
}

export default { getOrCreate, update }
