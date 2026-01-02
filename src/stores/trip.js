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

export const useTripStore = defineStore('trip', () => {
    const authStore = useAuthStore()

    const trips = ref([])
    const currentTrip = ref(null)
    const activeDay = ref(0)
    const unsubscribeSnapshot = ref(null)
    const isTripsLoading = ref(false)

    const currentDaySpots = computed(() => {
        return currentTrip.value?.itinerary[activeDay.value]?.spots || []
    })

    function initTripsListener() {
        if (authStore.isDemoMode) {
            const data = localStorage.getItem('maplio_demo_data')
            trips.value = data ? JSON.parse(data) : []
            isTripsLoading.value = false
            return
        }

        if (authStore.user) {
            if (unsubscribeSnapshot.value) return

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

    async function checkAndJoinTrip(tripId) {
        if (!tripId || authStore.isDemoMode || !authStore.user) return

        const existing = trips.value.find((t) => t.id === tripId)
        if (existing) {
            selectTrip(tripId)
            return
        }

        try {
            const trip = await getTripDoc(tripId)
            if (trip) {
                if (!trip.members.includes(authStore.user.uid)) {
                    await joinTripService(tripId, authStore.user.uid)
                }
                currentTrip.value = trip
                activeDay.value = 0
            }
        } catch (err) {
            console.error('加入行程失敗:', err)
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

        if (authStore.isDemoMode) {
            const idx = trips.value.findIndex((t) => t.id === currentTrip.value.id)
            if (idx !== -1) {
                trips.value[idx] = JSON.parse(JSON.stringify(currentTrip.value))
                localStorage.setItem('maplio_demo_data', JSON.stringify(trips.value))
            }
        } else {
            await saveTripData(currentTrip.value.id, currentTrip.value)
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
        if (!currentTrip.value) return
        currentTrip.value.itinerary.push({ spots: [] })
        activeDay.value = currentTrip.value.itinerary.length - 1
        saveData()
    }

    function removeDay() {
        if (!currentTrip.value || currentTrip.value.itinerary.length <= 1) return
        currentTrip.value.itinerary.splice(activeDay.value, 1)
        activeDay.value = Math.max(0, activeDay.value - 1)
        saveData()
    }

    function updateCurrentDaySpots(newSpots) {
        if (!currentTrip.value) return
        currentTrip.value.itinerary[activeDay.value].spots = newSpots
        saveData()
    }

    return {
        trips,
        currentTrip,
        activeDay,
        currentDaySpots,
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
        updateCurrentDaySpots
    }
})
