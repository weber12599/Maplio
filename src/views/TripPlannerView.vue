<template>
    <div v-if="isLoading" class="flex-grow flex items-center justify-center h-full">
        <div class="flex flex-col items-center gap-4 opacity-50">
            <i
                :class="[
                    'fa-solid fa-circle-notch fa-spin text-3xl',
                    activeThemeConfig.loadingIconClass || 'text-stone-400'
                ]"
            ></i>
            <p class="text-sm font-bold">載入行程中...</p>
        </div>
    </div>

    <div
        v-else-if="tripStore.currentTrip"
        class="flex-grow flex flex-col md:flex-row overflow-hidden relative"
    >
        <aside
            :class="[
                'w-full md:w-[450px] lg:w-[500px] flex flex-col h-full md:border-r z-20 shrink-0 transition-colors',
                activeThemeConfig.sidebarClass
            ]"
        >
            <div class="block md:hidden h-[220px] w-full shrink-0 border-b border-stone-200/50">
                <LeafletMap
                    mapId="mobile-map"
                    :spots="tripStore.currentDaySpots"
                    :currentTheme="themeStore.activeTheme"
                />
            </div>

            <DayTabs
                :itinerary="tripStore.currentTrip.itinerary"
                v-model:activeDay="tripStore.activeDay"
                :startDate="tripStore.currentTrip.startDate"
                :themeConfig="activeThemeConfig"
                @add-day="tripStore.addDay"
                @delete-day="tripStore.removeDay"
            />

            <div class="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
                <SearchBar
                    ref="searchBar"
                    :loading="isSearching"
                    :results="searchResults"
                    :themeConfig="activeThemeConfig"
                    @search="handleSearch"
                    @select="handleLocationSelect"
                />

                <draggable
                    v-model="currentDaySpotsWritable"
                    group="spots"
                    item-key="id"
                    handle=".drag-handle"
                >
                    <template #item="{ element, index }">
                        <SpotItem
                            :spot="element"
                            :nextSpot="tripStore.currentDaySpots[index + 1]"
                            :isLast="index === tripStore.currentDaySpots.length - 1"
                            :themeConfig="activeThemeConfig"
                            @edit="startEditSpot"
                            @copy="initiateCopySpot"
                            @remove="handleRemoveSpot(index)"
                            @open-map="openSpotOnMaps"
                            @update-data="tripStore.saveData"
                            @edit-transport="startEditTransport"
                            @navigate="
                                handleNavigate(element, tripStore.currentDaySpots[index + 1])
                            "
                        />
                    </template>
                </draggable>

                <div
                    v-if="tripStore.currentDaySpots.length === 0"
                    :class="[
                        'text-center py-20 border-2 border-dashed rounded-[3rem] opacity-30',
                        activeThemeConfig.secondaryBorderClass
                    ]"
                >
                    <p class="text-sm font-bold">今天還沒安排行程，試試搜尋景點吧！</p>
                </div>

                <div
                    v-if="tripStore.currentTrip && tripStore.currentTrip.itinerary.length > 1"
                    class="flex justify-center pt-8"
                >
                    <button
                        @click="tripStore.removeDay"
                        :class="[
                            'text-xs font-bold transition-all flex items-center gap-2 py-2 px-4 rounded-xl border opacity-40 hover:opacity-100',
                            themeStore.activeTheme === 'muji'
                                ? 'border-stone-200 text-stone-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                                : 'border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-900/50 hover:bg-red-900/10'
                        ]"
                    >
                        <i class="fa-solid fa-trash-can"></i>
                        刪除 Day {{ tripStore.activeDay + 1 }} 整天行程
                    </button>
                </div>
            </div>
        </aside>

        <LeafletMap
            mapId="desktop-map"
            :spots="tripStore.currentDaySpots"
            :currentTheme="themeStore.activeTheme"
            class="hidden md:block"
        />

        <SpotDialog
            v-if="showManualSpotForm"
            v-model="manualSpot"
            :themeConfig="activeThemeConfig"
            @cancel="showManualSpotForm = false"
            @confirm="addManualSpot"
        />

        <TransportDialog
            v-if="showTransportDialog"
            v-model="editingTransportSpot"
            :themeConfig="activeThemeConfig"
            @cancel="showTransportDialog = false"
            @confirm="updateTransportInfo"
        />

        <CopySpotDialog
            :isOpen="showCopyDialog"
            :totalDays="tripStore.currentTrip?.itinerary.length || 0"
            :currentDay="tripStore.activeDay"
            :themeConfig="activeThemeConfig"
            @close="showCopyDialog = false"
            @confirm="executeCopySpot"
        />

        <ShareDialog
            v-if="showShareDialog"
            :themeConfig="activeThemeConfig"
            @cancel="showShareDialog = false"
            @choice="handleShareChoice"
        />
    </div>

    <div v-else class="flex-grow flex items-center justify-center h-full opacity-40">
        <p class="text-sm font-bold">找不到此行程或無權限查看</p>
    </div>
</template>

<script setup>
import { ref, computed, defineExpose, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import { parseGoogleMapUrl, getNavUrl } from '../utils/mapUtils'

import SpotItem from '../components/Planner/SpotItem.vue'
import SpotDialog from '../components/Trip/SpotDialog.vue'
import DayTabs from '../components/Planner/DayTabs.vue'
import SearchBar from '../components/Planner/SearchBar.vue'
import LeafletMap from '../components/Map/LeafletMap.vue'
import TransportDialog from '../components/Planner/TransportDialog.vue'
import CopySpotDialog from '../components/Planner/CopySpotDialog.vue'
import ShareDialog from '../components/Trip/ShareDialog.vue'

import { useThemeStore } from '../stores/theme'
import { useTripStore } from '../stores/trip'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const themeStore = useThemeStore()
const tripStore = useTripStore()
const authStore = useAuthStore()

const { activeThemeConfig } = storeToRefs(themeStore)
const { user } = storeToRefs(authStore)

const isLoading = ref(true)
const showManualSpotForm = ref(false)
const showTransportDialog = ref(false)
const showCopyDialog = ref(false)
const showShareDialog = ref(false)
const manualSpot = ref({})
const editingTransportSpot = ref(null)
const spotToCopy = ref(null)
const searchResults = ref([])
const isSearching = ref(false)
const isEditingExistingSpot = ref(false)
const searchBar = ref(null)

const currentDaySpotsWritable = computed({
    get: () => tripStore.currentDaySpots,
    set: (val) => tripStore.updateCurrentDaySpots(val)
})

const loadTrip = async (id) => {
    if (!id) return
    isLoading.value = true
    try {
        await tripStore.checkAndJoinTrip(id)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    if (route.params.id) {
        loadTrip(route.params.id)
    }
})

watch(
    () => route.params.id,
    (newId) => {
        if (newId) {
            loadTrip(newId)
        }
    }
)

watch(user, (newUser) => {
    if (newUser && route.params.id && !tripStore.currentTrip) {
        loadTrip(route.params.id)
    }
})

const handleSearch = (query) => {
    if (query.startsWith('http')) {
        const parsed = parseGoogleMapUrl(query)
        manualSpot.value = parsed
            ? {
                  ...parsed,
                  url: query,
                  notes: '',
                  timeStart: '',
                  timeEnd: '',
                  showOnMap: true,
                  source: 'google_parsed'
              }
            : {
                  name: '',
                  url: query,
                  notes: '',
                  timeStart: '',
                  timeEnd: '',
                  showOnMap: false,
                  lat: null,
                  lng: null,
                  source: 'url_only'
              }
        isEditingExistingSpot.value = false
        showManualSpotForm.value = true
    } else {
        performKeywordSearch(query)
    }
}

const performKeywordSearch = async (q) => {
    isSearching.value = true
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`
        )
        searchResults.value = await res.json()
    } finally {
        isSearching.value = false
    }
}

const handleLocationSelect = (res) => {
    const lat = parseFloat(res.lat)
    const lng = parseFloat(res.lon)
    manualSpot.value = {
        name: res.display_name.split(',')[0],
        lat: isNaN(lat) ? null : lat,
        lng: isNaN(lng) ? null : lng,
        url: `http://googleusercontent.com/maps.google.com/?q=${lat},${lng}`,
        notes: '',
        timeStart: '',
        timeEnd: '',
        showOnMap: true,
        source: 'search'
    }
    showManualSpotForm.value = true
    searchResults.value = []
    if (searchBar.value) searchBar.value.clear()
}

const addManualSpot = (spotData) => {
    const spots = [...tripStore.currentDaySpots]
    if (isEditingExistingSpot.value) {
        const idx = spots.findIndex((s) => s.id === spotData.id)
        if (idx !== -1) spots[idx] = { ...spotData }
    } else {
        const spot = {
            ...spotData,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            travelMode: 'auto',
            showOnMap: !!(spotData.lat && spotData.lng)
        }
        spots.push(spot)
    }
    tripStore.updateCurrentDaySpots(spots)
    if (searchBar.value) searchBar.value.clear()
    showManualSpotForm.value = false
}

const startEditSpot = (spot) => {
    manualSpot.value = JSON.parse(JSON.stringify(spot))
    isEditingExistingSpot.value = true
    showManualSpotForm.value = true
}

const handleRemoveSpot = (index) => {
    const spots = [...tripStore.currentDaySpots]
    spots.splice(index, 1)
    tripStore.updateCurrentDaySpots(spots)
}

const startEditTransport = (spot) => {
    editingTransportSpot.value = spot
    showTransportDialog.value = true
}

const updateTransportInfo = (updatedSpotData) => {
    const spots = [...tripStore.currentDaySpots]
    const idx = spots.findIndex((s) => s.id === updatedSpotData.id)
    if (idx !== -1) {
        spots[idx] = { ...updatedSpotData }
        tripStore.updateCurrentDaySpots(spots)
    }
    showTransportDialog.value = false
    editingTransportSpot.value = null
}

const initiateCopySpot = (spot) => {
    spotToCopy.value = spot
    showCopyDialog.value = true
}

const executeCopySpot = async (targetDayIndexes) => {
    if (!spotToCopy.value || !tripStore.currentTrip) return
    try {
        const newItinerary = JSON.parse(JSON.stringify(tripStore.currentTrip.itinerary))
        targetDayIndexes.forEach((dayIdx) => {
            const newSpot = JSON.parse(JSON.stringify(spotToCopy.value))
            newSpot.id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
            if (!newItinerary[dayIdx]) newItinerary[dayIdx] = { spots: [] }
            newItinerary[dayIdx].spots.push(newSpot)
        })
        tripStore.currentTrip.itinerary = newItinerary
        await tripStore.saveData()
        alert(`成功複製景點到 ${targetDayIndexes.length} 個日期！`)
    } catch (error) {
        console.error('複製失敗', error)
        alert('複製失敗，請稍後再試')
    } finally {
        showCopyDialog.value = false
        spotToCopy.value = null
    }
}

const openSpotOnMaps = (spot) => {
    window.open(
        spot.url || `http://googleusercontent.com/maps.google.com/?q=${spot.lat},${spot.lng}`,
        '_blank'
    )
}

const handleNavigate = (start, end) => {
    window.open(getNavUrl(start, end, start.travelMode), '_blank')
}

const openShareDialog = () => {
    if (authStore.isDemoMode) {
        const tripJson = JSON.stringify(tripStore.currentTrip, null, 2)
        executeShare('行程 JSON 資料', tripJson, true)
    } else {
        showShareDialog.value = true
    }
}

const handleShareChoice = async (choice) => {
    showShareDialog.value = false
    if (choice === 'url') {
        await executeShare('旅程連結', window.location.href, false)
    } else if (choice === 'json') {
        const tripJson = JSON.stringify(tripStore.currentTrip, null, 2)
        await executeShare('行程 JSON 資料', tripJson, true)
    }
}

const executeShare = async (label, content, isText) => {
    const title = `Maplio ${label}: ${tripStore.currentTrip.name}`
    if (navigator.share) {
        try {
            await navigator.share({ title, [isText ? 'text' : 'url']: content })
            return
        } catch (err) {
            if (err.name === 'AbortError') return
        }
    }
    try {
        await navigator.clipboard.writeText(content)
        alert(`${label} 已複製到剪貼簿！`)
    } catch (err) {
        alert('複製失敗')
    }
}

defineExpose({
    openShareDialog
})
</script>
