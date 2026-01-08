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
            <div
                class="block md:hidden h-[220px] w-full shrink-0 border-b border-stone-200/50 relative group"
            >
                <div
                    class="absolute top-2 right-2 z-[9999] bg-white/90 backdrop-blur rounded-md shadow-sm border border-stone-200 p-1 flex gap-1"
                >
                    <button
                        @click="viewMode = 'map'"
                        title="地圖"
                        :class="[
                            'w-8 h-8 flex items-center justify-center rounded text-sm transition-colors',
                            viewMode === 'map'
                                ? 'bg-stone-800 text-white shadow-sm'
                                : 'text-stone-400 hover:bg-stone-100'
                        ]"
                    >
                        <i class="fa-solid fa-map"></i>
                    </button>
                    <button
                        @click="viewMode = 'summary'"
                        title="摘要"
                        :class="[
                            'w-8 h-8 flex items-center justify-center rounded text-sm transition-colors',
                            viewMode === 'summary'
                                ? 'bg-stone-800 text-white shadow-sm'
                                : 'text-stone-400 hover:bg-stone-100'
                        ]"
                    >
                        <i class="fa-solid fa-align-left"></i>
                    </button>
                    <button
                        @click="viewMode = 'todo'"
                        title="待辦事項"
                        :class="[
                            'w-8 h-8 flex items-center justify-center rounded text-sm transition-colors',
                            viewMode === 'todo'
                                ? 'bg-stone-800 text-white shadow-sm'
                                : 'text-stone-400 hover:bg-stone-100'
                        ]"
                    >
                        <i class="fa-solid fa-list-check"></i>
                    </button>
                </div>

                <LeafletMap
                    v-show="viewMode === 'map'"
                    mapId="mobile-map"
                    :spots="tripStore.currentDaySpots"
                    :currentTheme="themeStore.activeTheme"
                    class="w-full h-full"
                />

                <DayInfo
                    v-if="viewMode === 'summary' || viewMode === 'todo'"
                    :mode="viewMode"
                    :summary="currentDayMeta.summary"
                    :todos="currentDayMeta.todos"
                    :themeConfig="activeThemeConfig"
                    @update="handleMetaUpdate"
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

            <div
                class="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8 pb-32"
                @touchstart="handleTouchStart"
                @touchend="handleTouchEnd"
            >
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

        <div class="hidden md:flex relative flex-grow h-full flex-col overflow-hidden bg-stone-50">
            <div
                class="absolute top-4 right-4 z-[9999] bg-white rounded-lg shadow-md p-1 flex items-center border border-stone-200"
            >
                <button
                    @click="viewMode = 'map'"
                    :class="[
                        'px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2',
                        viewMode === 'map'
                            ? 'bg-stone-800 text-white shadow-sm'
                            : 'text-stone-500 hover:bg-stone-100'
                    ]"
                >
                    <i class="fa-solid fa-map"></i>
                    <span class="hidden lg:inline">地圖</span>
                </button>
                <button
                    @click="viewMode = 'info'"
                    :class="[
                        'px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2',
                        // 如果現在是 summary 或 todo 模式，桌機版也視為 info 模式 active
                        viewMode !== 'map'
                            ? 'bg-stone-800 text-white shadow-sm'
                            : 'text-stone-500 hover:bg-stone-100'
                    ]"
                >
                    <i class="fa-solid fa-clipboard-list"></i>
                    <span class="hidden lg:inline">筆記</span>
                </button>
            </div>

            <LeafletMap
                v-show="viewMode === 'map'"
                mapId="desktop-map"
                :spots="tripStore.currentDaySpots"
                :currentTheme="themeStore.activeTheme"
                class="flex-grow w-full h-full"
            />

            <DayInfo
                v-if="viewMode !== 'map'"
                mode="all"
                :summary="currentDayMeta.summary"
                :todos="currentDayMeta.todos"
                :themeConfig="activeThemeConfig"
                @update="handleMetaUpdate"
            />
        </div>

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
// Script setup 內容與之前相同，不需要更動
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
import DayInfo from '../components/Planner/DayInfo.vue'

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

// 視圖模式: 'map', 'summary', 'todo', 'info'
const viewMode = ref('map')

const currentDaySpotsWritable = computed({
    get: () => tripStore.currentDaySpots,
    set: (val) => tripStore.updateCurrentDaySpots(val)
})

const currentDayMeta = computed(() => {
    if (!tripStore.currentTrip) return { summary: '', todos: [] }
    const day = tripStore.currentTrip.itinerary[tripStore.activeDay]
    return {
        summary: day.summary || '',
        todos: day.todos || []
    }
})

const handleMetaUpdate = (newData) => {
    tripStore.updateCurrentDayMeta(newData)
}

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
        if (newId) loadTrip(newId)
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

// Swipe
const touchStartX = ref(0)
const touchStartY = ref(0)

const handleTouchStart = (e) => {
    touchStartX.value = e.changedTouches[0].screenX
    touchStartY.value = e.changedTouches[0].screenY
}

const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].screenX
    const touchEndY = e.changedTouches[0].screenY

    const diffX = touchEndX - touchStartX.value
    const diffY = touchEndY - touchStartY.value

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        const maxDay = tripStore.currentTrip?.itinerary?.length - 1 || 0

        if (diffX > 0) {
            if (tripStore.activeDay > 0) {
                tripStore.activeDay--
            }
        } else {
            if (tripStore.activeDay < maxDay) {
                tripStore.activeDay++
            }
        }
    }
}

defineExpose({
    openShareDialog
})
</script>
