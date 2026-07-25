import settingsRepository from '../repositories/settings.repository.js'

/**
 * settingsService — reads/updates the global Settings document, creating it with
 * defaults (commissionRate 0.10) on first access.
 */

function getSettings() {
  return settingsRepository.getOrCreate()
}

function updateSettings(patch) {
  return settingsRepository.update(patch)
}

export default { getSettings, updateSettings }
