<template>
    <div class="flex-grow overflow-y-auto p-6 md:p-10 no-scrollbar relative flex flex-col">
        <div
            v-if="tripStore.isTripsLoading"
            class="flex-grow flex items-center justify-center min-h-[200px]"
        >
            <div class="flex flex-col items-center gap-4 opacity-50">
                <i
                    :class="[
                        'fa-solid fa-circle-notch fa-spin text-3xl',
                        activeThemeConfig.loadingIconClass || 'text-stone-400'
                    ]"
                ></i>
                <p class="text-sm font-bold">正在讀取行程...</p>
            </div>
        </div>

        <div
            v-else-if="tripStore.trips.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full"
        >
            <TripCard
                v-for="trip in tripStore.trips"
                :key="trip.id"
                :trip="trip"
                :themeConfig="activeThemeConfig"
                @select="handleSelectTrip"
                @delete="tripStore.deleteTrip"
            />
        </div>

        <div
            v-else
            class="flex-grow flex flex-col items-center justify-center opacity-40 gap-4 min-h-[300px]"
        >
            <i class="fa-solid fa-map-location-dot text-6xl mb-2"></i>
            <h3 class="text-xl font-bold">還沒有任何行程</h3>
            <p class="text-sm">點擊右上角的「建立行程」開始規劃吧！</p>
            <p v-if="authStore.isDemoMode" class="text-xs text-stone-400 mt-2">
                (Demo 模式建立的行程僅儲存於瀏覽器，不會同步至雲端)
            </p>
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTripStore } from '../stores/trip'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import TripCard from '../components/Trip/TripCard.vue'

const router = useRouter()
const tripStore = useTripStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const { activeThemeConfig } = storeToRefs(themeStore)
const { user } = storeToRefs(authStore)

const handleSelectTrip = (trip) => {
    tripStore.selectTrip(trip.id)
    router.push({ name: 'trip', params: { id: trip.id } })
}

onMounted(async () => {
    if (!authStore.user && !authStore.isDemoMode) {
        await authStore.initAuthListener()
    }

    if (authStore.user || authStore.isDemoMode) {
        tripStore.initTripsListener()
    }
})

watch(user, (newUser) => {
    if (newUser) {
        tripStore.initTripsListener()
    }
})
</script>
