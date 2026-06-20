// Per-browser "confirmed / in-use" plan selection for each day of a trip.
// This is intentionally local-only (not synced to the cloud), so each user can
// mark which plan they consider confirmed without affecting collaborators.
// Shape: { [dayIndex: number]: planId: string }

const keyFor = (tripId) => `maplio_pins_${tripId}`

export function loadPins(tripId) {
    if (!tripId) return {}
    try {
        const raw = localStorage.getItem(keyFor(tripId))
        return raw ? JSON.parse(raw) : {}
    } catch (e) {
        console.error('[pinUtils] Failed to parse pins from localStorage:', e)
        return {}
    }
}

export function savePins(tripId, pins) {
    if (!tripId) return
    try {
        localStorage.setItem(keyFor(tripId), JSON.stringify(pins))
    } catch (e) {
        console.error('[pinUtils] Failed to save pins to localStorage:', e)
    }
}
