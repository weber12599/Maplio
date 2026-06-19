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

function debounce(fn, delay) {
    let timeoutId = null
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

export const useTripStore = defineStore('trip', () => {
    const authStore = useAuthStore()

    const trips = ref([])
    const currentTrip = ref(null)
    const activeDay = ref(0)
    const unsubscribeSnapshot = ref(null)
    const isTripsLoading = ref(false)

    const debouncedSaveToCloud = debounce(async (tripId, tripData) => {
        try {
            await saveTripData(tripId, tripData)
        } catch (err) {
            console.error('[AutoSave] Failed:', err)
        }
    }, 1500)

    const currentDaySpots = computed(() => {
        return currentTrip.value?.itinerary[activeDay.value]?.spots || []
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
                    if (found) currentTrip.value = found
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
                currentTrip.value = trip
                activeDay.value = 0
            }
        } catch (err) {
            console.error('Fail to join trip:', err)
        }
    }

    function selectTrip(tripId) {
        const trip = trips.value.find((t) => t.id === tripId)
        if (trip) {
            currentTrip.value = trip
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
        currentTrip.value.itinerary.push({ spots: [] })
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
        currentTrip.value.itinerary[activeDay.value].spots = newSpots
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
        currentDaySpots,
        currentUserRole,
        canEdit,
        canDelete,
        isTripsLoading,
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
        updateCurrentDayMeta
    }
})
