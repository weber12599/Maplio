import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import {
    subscribeTrips,
    saveTripData,
    deleteTripDoc,
    getTripDoc,
    joinTrip as joinTripService
} from '../services/tripService'
import { loadPins, savePins } from '../utils/pinUtils'

function debounce(fn, delay) {
    let timeoutId = null
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

function genId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5)
}

// A "plan" is a full-day version of an itinerary: { id, name, spots }.
// Older trips stored a single `spots` array per day; normalize them into a
// single plan so the rest of the app can rely on `day.plans`.
function normalizeDay(day) {
    if (!day) return { plans: [{ id: genId(), name: '', spots: [] }] }
    if (Array.isArray(day.plans) && day.plans.length > 0) return day
    const { spots, ...rest } = day
    return { ...rest, plans: [{ id: genId(), name: '', spots: Array.isArray(spots) ? spots : [] }] }
}

function normalizeTrip(trip) {
    if (trip && Array.isArray(trip.itinerary)) {
        trip.itinerary = trip.itinerary.map(normalizeDay)
    }
    return trip
}

export const useTripStore = defineStore('trip', () => {
    const authStore = useAuthStore()

    const trips = ref([])
    const currentTrip = ref(null)
    const activeDay = ref(0)
    const unsubscribeSnapshot = ref(null)
    const isTripsLoading = ref(false)

    // Per-browser "confirmed / in-use" plan per day: { [dayIndex]: planId }.
    // Local-only (localStorage), never synced — see utils/pinUtils.js.
    const pins = ref({})

    const debouncedSaveToCloud = debounce(async (tripId, tripData) => {
        try {
            await saveTripData(tripId, tripData)
        } catch (err) {
            console.error('[AutoSave] Failed:', err)
        }
    }, 1500)

    // Resolve which plan is active for a day: the locally-pinned one if it still
    // exists, otherwise fall back to the first plan.
    function getActivePlanId(dayIndex) {
        const day = currentTrip.value?.itinerary?.[dayIndex]
        if (!day?.plans?.length) return null
        const pinned = pins.value[dayIndex]
        if (pinned && day.plans.some((p) => p.id === pinned)) return pinned
        return day.plans[0].id
    }

    function getActivePlan(dayIndex) {
        const day = currentTrip.value?.itinerary?.[dayIndex]
        if (!day?.plans?.length) return null
        const id = getActivePlanId(dayIndex)
        return day.plans.find((p) => p.id === id) || day.plans[0]
    }

    const currentDaySpots = computed(() => {
        return getActivePlan(activeDay.value)?.spots || []
    })

    const currentUserRole = computed(() => {
        if (!currentTrip.value || !authStore.user) return null
        const uid = authStore.isDemoMode ? 'demo-user' : authStore.user.uid
        const perms = currentTrip.value.permissions
        if (!perms) {
            return currentTrip.value.members?.includes(uid) ? 'owner' : null
        }
        return perms[uid] || null
    })

    const canEdit = computed(() => {
        return ['owner', 'editor'].includes(currentUserRole.value)
    })

    const canDelete = computed(() => {
        return currentUserRole.value === 'owner'
    })

    // Normalize legacy day shapes and (re)hydrate local pins when switching trips.
    function setCurrentTrip(trip) {
        const normalized = normalizeTrip(trip)
        const idChanged = currentTrip.value?.id !== normalized?.id
        currentTrip.value = normalized
        if (normalized && idChanged) {
            pins.value = loadPins(normalized.id)
        }
    }

    function initTripsListener() {
        if (unsubscribeSnapshot.value) {
            unsubscribeSnapshot.value()
            unsubscribeSnapshot.value = null
        }

        if (authStore.isDemoMode) {
            const data = localStorage.getItem('maplio_demo_data')
            try {
                trips.value = data ? JSON.parse(data) : []
            } catch (e) {
                console.error('[trip] Failed to parse demo data from localStorage:', e)
                trips.value = []
            }
            isTripsLoading.value = false
            return
        }

        if (authStore.user) {
            isTripsLoading.value = true
            trips.value = []

            unsubscribeSnapshot.value = subscribeTrips(authStore.user.uid, (data) => {
                trips.value = data
                isTripsLoading.value = false

                if (currentTrip.value) {
                    const found = data.find((t) => t.id === currentTrip.value.id)
                    if (found) setCurrentTrip(found)
                }
            })
        }
    }

    function stopTripsListener() {
        if (unsubscribeSnapshot.value) {
            unsubscribeSnapshot.value()
            unsubscribeSnapshot.value = null
        }
        trips.value = []
        isTripsLoading.value = false
    }

    async function checkAndJoinTrip(tripId, inviteRole = null) {
        if (!tripId) return

        if (authStore.isDemoMode) {
            if (trips.value.length === 0) {
                const data = localStorage.getItem('maplio_demo_data')
                if (data) {
                    try {
                        trips.value = JSON.parse(data)
                    } catch (e) {
                        console.error('[trip] Failed to parse demo data in checkAndJoinTrip:', e)
                    }
                }
            }

            const existing = trips.value.find((t) => t.id === tripId)
            if (existing) {
                selectTrip(tripId)
            } else {
                console.warn('Demo trip not found:', tripId)
                currentTrip.value = null
            }
            return
        }

        if (!authStore.user) return

        const existing = trips.value.find((t) => t.id === tripId)
        if (existing) {
            selectTrip(tripId)
            return
        }

        try {
            const trip = await getTripDoc(tripId)
            if (trip) {
                if (!trip.members.includes(authStore.user.uid)) {
                    const role = ['viewer', 'editor'].includes(inviteRole) ? inviteRole : 'viewer'
                    await joinTripService(tripId, authStore.user.uid, role, authStore.user)
                }
                setCurrentTrip(trip)
                activeDay.value = 0
            }
        } catch (err) {
            console.error('Fail to join trip:', err)
        }
    }

    function selectTrip(tripId) {
        const trip = trips.value.find((t) => t.id === tripId)
        if (trip) {
            setCurrentTrip(trip)
            activeDay.value = 0
        }
    }

    async function saveData() {
        if (!currentTrip.value) return
        if (!canEdit.value) {
            console.warn('[TripStore] saveData blocked: user is viewer')
            return
        }

        if (authStore.isDemoMode) {
            const idx = trips.value.findIndex((t) => t.id === currentTrip.value.id)
            if (idx !== -1) {
                trips.value[idx] = JSON.parse(JSON.stringify(currentTrip.value))
                localStorage.setItem('maplio_demo_data', JSON.stringify(trips.value))
            }
        } else {
            debouncedSaveToCloud(currentTrip.value.id, currentTrip.value)
        }
    }

    async function deleteTrip(tripId) {
        if (authStore.isDemoMode) {
            trips.value = trips.value.filter((t) => t.id !== tripId)
            localStorage.setItem('maplio_demo_data', JSON.stringify(trips.value))
        } else {
            await deleteTripDoc(tripId)
        }
        if (currentTrip.value?.id === tripId) {
            currentTrip.value = null
        }
    }

    function addLocalTrip(newTrip) {
        if (authStore.isDemoMode) {
            trips.value.unshift(newTrip)
            localStorage.setItem('maplio_demo_data', JSON.stringify(trips.value))
        }
    }

    function addDay() {
        if (!currentTrip.value || !canEdit.value) return
        currentTrip.value.itinerary.push({ plans: [{ id: genId(), name: '', spots: [] }] })
        activeDay.value = currentTrip.value.itinerary.length - 1
        saveData()
    }

    function removeDay() {
        if (!currentTrip.value || currentTrip.value.itinerary.length <= 1 || !canEdit.value) return
        currentTrip.value.itinerary.splice(activeDay.value, 1)
        activeDay.value = Math.max(0, activeDay.value - 1)
        saveData()
    }

    function updateCurrentDaySpots(newSpots) {
        if (!currentTrip.value || !canEdit.value) return
        const plan = getActivePlan(activeDay.value)
        if (!plan) return
        plan.spots = newSpots
        saveData()
    }

    // --- Plans (per-day alternative full-day itineraries) ---

    // Set the locally "in use / confirmed" plan for a day. Local-only: not gated
    // by canEdit and never written to the synced trip data.
    function setActivePlan(dayIndex, planId) {
        pins.value = { ...pins.value, [dayIndex]: planId }
        if (currentTrip.value) savePins(currentTrip.value.id, pins.value)
    }

    function addPlan(dayIndex, name = '') {
        if (!currentTrip.value || !canEdit.value) return
        const day = currentTrip.value.itinerary[dayIndex]
        if (!day) return
        if (!day.plans) day.plans = []
        const plan = { id: genId(), name, spots: [] }
        day.plans.push(plan)
        saveData()
        return plan.id
    }

    function duplicatePlan(dayIndex, planId, name = '') {
        if (!currentTrip.value || !canEdit.value) return
        const day = currentTrip.value.itinerary[dayIndex]
        const src = day?.plans?.find((p) => p.id === planId)
        if (!src) return
        const copy = JSON.parse(JSON.stringify(src))
        copy.id = genId()
        copy.name = name || src.name
        copy.spots = (copy.spots || []).map((s) => ({ ...s, id: genId() }))
        day.plans.push(copy)
        saveData()
        return copy.id
    }

    function renamePlan(dayIndex, planId, name) {
        if (!currentTrip.value || !canEdit.value) return
        const plan = currentTrip.value.itinerary[dayIndex]?.plans?.find((p) => p.id === planId)
        if (!plan) return
        plan.name = name
        saveData()
    }

    function removePlan(dayIndex, planId) {
        if (!currentTrip.value || !canEdit.value) return
        const day = currentTrip.value.itinerary[dayIndex]
        if (!day?.plans || day.plans.length <= 1) return
        day.plans = day.plans.filter((p) => p.id !== planId)
        if (pins.value[dayIndex] === planId) {
            const next = { ...pins.value }
            delete next[dayIndex]
            pins.value = next
            savePins(currentTrip.value.id, pins.value)
        }
        saveData()
    }

    // Copy a single spot into the active plan of each target day (used by the
    // "copy spot to other days" action).
    function copySpotToDays(spot, dayIndexes) {
        if (!currentTrip.value || !canEdit.value) return
        dayIndexes.forEach((dayIdx) => {
            const plan = getActivePlan(dayIdx)
            if (!plan) return
            const newSpot = JSON.parse(JSON.stringify(spot))
            newSpot.id = genId()
            plan.spots.push(newSpot)
        })
        saveData()
    }

    // --- Plan pool (trip-level library of full-day plans) ---

    function savePlanToPool(dayIndex, planId, name = '') {
        if (!currentTrip.value || !canEdit.value) return
        const src = currentTrip.value.itinerary[dayIndex]?.plans?.find((p) => p.id === planId)
        if (!src) return
        if (!currentTrip.value.planPool) currentTrip.value.planPool = []
        const copy = JSON.parse(JSON.stringify(src))
        copy.id = genId()
        copy.name = name || src.name
        copy.spots = (copy.spots || []).map((s) => ({ ...s, id: genId() }))
        currentTrip.value.planPool.push(copy)
        saveData()
        return copy.id
    }

    function renamePoolPlan(poolPlanId, name) {
        if (!currentTrip.value || !canEdit.value) return
        const plan = currentTrip.value.planPool?.find((p) => p.id === poolPlanId)
        if (!plan) return
        plan.name = name
        saveData()
    }

    function removePoolPlan(poolPlanId) {
        if (!currentTrip.value || !canEdit.value || !currentTrip.value.planPool) return
        currentTrip.value.planPool = currentTrip.value.planPool.filter((p) => p.id !== poolPlanId)
        saveData()
    }

    function copyPoolPlanToDays(poolPlanId, dayIndexes) {
        if (!currentTrip.value || !canEdit.value) return
        const src = currentTrip.value.planPool?.find((p) => p.id === poolPlanId)
        if (!src) return
        dayIndexes.forEach((dayIdx) => {
            const day = currentTrip.value.itinerary[dayIdx]
            if (!day) return
            if (!day.plans) day.plans = []
            const copy = JSON.parse(JSON.stringify(src))
            copy.id = genId()
            copy.spots = (copy.spots || []).map((s) => ({ ...s, id: genId() }))
            day.plans.push(copy)
        })
        saveData()
    }

    function updateCurrentDayMeta(metaData) {
        if (!currentTrip.value || !canEdit.value) return

        const dayObj = currentTrip.value.itinerary[activeDay.value]

        currentTrip.value.itinerary[activeDay.value] = {
            ...dayObj,
            ...metaData
        }

        saveData()
    }

    return {
        trips,
        currentTrip,
        activeDay,
        pins,
        currentDaySpots,
        currentUserRole,
        canEdit,
        canDelete,
        isTripsLoading,
        getActivePlanId,
        getActivePlan,
        initTripsListener,
        stopTripsListener,
        checkAndJoinTrip,
        selectTrip,
        saveData,
        deleteTrip,
        addLocalTrip,
        addDay,
        removeDay,
        updateCurrentDaySpots,
        updateCurrentDayMeta,
        setActivePlan,
        addPlan,
        duplicatePlan,
        renamePlan,
        removePlan,
        copySpotToDays,
        savePlanToPool,
        renamePoolPlan,
        removePoolPlan,
        copyPoolPlanToDays
    }
})
