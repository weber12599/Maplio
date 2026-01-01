<template>
    <div
        :class="[
            'font-sans h-dvh flex flex-col overflow-hidden selection:bg-blue-500/30 transition-colors duration-500',
            activeThemeConfig.appClass
        ]"
    >
        <LoginScreen
            v-if="!user"
            :themeConfig="activeThemeConfig"
            @login="handleGoogleLogin"
            @demo="enterDemoMode"
            :appVersion="appVersion"
        />

        <div v-else class="flex flex-col h-full overflow-hidden">
            <AppHeader
                :user="user"
                :currentTrip="currentTrip"
                :isDemo="isDemoMode"
                :showAddButton="!currentTrip && !showCreateForm"
                :currentTheme="activeTheme"
                :themeClass="activeThemeConfig.headerClass"
                :appVersion="appVersion"
                @logout="logout"
                @back="backToList"
                @create="showCreateForm = true"
                @update-theme="activeTheme = $event"
                @import="handleImportTrip"
                @share="handleShareTrip"
            />

            <main
                class="flex-grow flex flex-col md:flex-row overflow-hidden relative"
                style="
                    padding-left: env(safe-area-inset-left);
                    padding-right: env(safe-area-inset-right);
                "
            >
                <div v-if="!currentTrip" class="flex-grow overflow-y-auto p-6 md:p-10 no-scrollbar">
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                    >
                        <TripCard
                            v-for="trip in trips"
                            :key="trip.id"
                            :trip="trip"
                            :themeConfig="activeThemeConfig"
                            @select="selectTrip"
                            @delete="handleDeleteTrip"
                        />
                    </div>
                </div>

                <template v-else>
                    <aside
                        :class="[
                            'w-full md:w-[450px] lg:w-[500px] flex flex-col h-full md:border-r z-20 shrink-0 transition-colors',
                            activeThemeConfig.sidebarClass
                        ]"
                    >
                        <div
                            class="block md:hidden h-[220px] w-full shrink-0 border-b border-stone-200/50"
                        >
                            <LeafletMap
                                mapId="mobile-map"
                                :spots="currentDaySpots"
                                :currentTheme="activeTheme"
                            />
                        </div>
                        <DayTabs
                            :itinerary="currentTrip.itinerary"
                            v-model:activeDay="activeDay"
                            :startDate="currentTrip.startDate"
                            :themeConfig="activeThemeConfig"
                            @add-day="handleAddDay"
                            @delete-day="handleDeleteDay"
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
                                v-model="currentDaySpots"
                                group="spots"
                                item-key="id"
                                handle=".drag-handle"
                                @change="saveData"
                            >
                                <template #item="{ element, index }">
                                    <SpotItem
                                        :spot="element"
                                        :nextSpot="currentDaySpots[index + 1]"
                                        :isLast="index === currentDaySpots.length - 1"
                                        :themeConfig="activeThemeConfig"
                                        @edit="startEditSpot"
                                        @remove="handleRemoveSpot(index)"
                                        @open-map="openSpotOnMaps"
                                        @update-data="saveData"
                                        @edit-transport="startEditTransport"
                                        @navigate="
                                            handleNavigate(element, currentDaySpots[index + 1])
                                        "
                                    />
                                </template>
                            </draggable>
                            <div
                                v-if="currentDaySpots.length === 0"
                                :class="[
                                    'text-center py-20 border-2 border-dashed rounded-[3rem] opacity-30',
                                    activeThemeConfig.secondaryBorderClass
                                ]"
                            >
                                <p class="text-sm font-bold">今天還沒安排行程，試試搜尋景點吧！</p>
                            </div>

                            <div
                                v-if="currentTrip && currentTrip.itinerary.length > 1"
                                class="flex justify-center pt-8"
                            >
                                <button
                                    @click="handleDeleteDay"
                                    :class="[
                                        'text-xs font-bold transition-all flex items-center gap-2 py-2 px-4 rounded-xl border opacity-40 hover:opacity-100',
                                        activeTheme === 'muji'
                                            ? 'border-stone-200 text-stone-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                                            : 'border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-900/50 hover:bg-red-900/10'
                                    ]"
                                >
                                    <i class="fa-solid fa-trash-can"></i>
                                    刪除 Day {{ activeDay + 1 }} 整天行程
                                </button>
                            </div>
                        </div>
                    </aside>
                    <LeafletMap
                        mapId="desktop-map"
                        :spots="currentDaySpots"
                        :currentTheme="activeTheme"
                        class="hidden md:block"
                    />
                </template>

                <TripCreateForm
                    v-if="showCreateForm"
                    :isDemo="isDemoMode"
                    :user="user"
                    :themeConfig="activeThemeConfig"
                    @cancel="showCreateForm = false"
                    @created="handleTripCreated"
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

                <ShareDialog
                    v-if="showShareDialog"
                    :themeConfig="activeThemeConfig"
                    @cancel="showShareDialog = false"
                    @choice="handleShareChoice"
                />
            </main>
        </div>
    </div>
</template>

<script>
import draggable from 'vuedraggable'
import { auth, googleProvider } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { subscribeTrips, saveTripData, deleteTripDoc } from './services/tripService'
import { parseGoogleMapUrl, getNavUrl } from './utils/mapUtils'
import { themes } from './utils/themeUtils'

import LoginScreen from './components/Auth/LoginScreen.vue'
import AppHeader from './components/Layout/AppHeader.vue'
import TripCard from './components/Trip/TripCard.vue'
import TripCreateForm from './components/Trip/TripCreateForm.vue'
import SpotItem from './components/Planner/SpotItem.vue'
import SpotDialog from './components/Trip/SpotDialog.vue'
import DayTabs from './components/Planner/DayTabs.vue'
import SearchBar from './components/Planner/SearchBar.vue'
import LeafletMap from './components/Map/LeafletMap.vue'
import TransportDialog from './components/Planner/TransportDialog.vue'
import ShareDialog from './components/Trip/ShareDialog.vue'

export default {
    components: {
        draggable,
        LoginScreen,
        AppHeader,
        TripCard,
        TripCreateForm,
        SpotItem,
        SpotDialog,
        DayTabs,
        SearchBar,
        LeafletMap,
        TransportDialog,
        ShareDialog
    },
    data() {
        return {
            user: null,
            trips: [],
            currentTrip: null,
            activeDay: 0,
            isDemoMode: false,
            showCreateForm: false,
            showManualSpotForm: false,
            manualSpot: {},
            searchResults: [],
            isSearching: false,
            isEditingExistingSpot: false,
            showTransportDialog: false,
            editingTransportSpot: null,
            showShareDialog: false,
            activeTheme: localStorage.getItem('maplio_theme') || 'dark',
            appVersion: import.meta.env.VITE_APP_VERSION || 'v0.0.0'
        }
    },
    computed: {
        activeThemeConfig() {
            return themes[this.activeTheme]
        },
        currentDaySpots: {
            get() {
                return this.currentTrip?.itinerary[this.activeDay]?.spots || []
            },
            set(val) {
                this.currentTrip.itinerary[this.activeDay].spots = val
            }
        }
    },
    watch: {
        activeTheme: {
            handler(newTheme) {
                localStorage.setItem('maplio_theme', newTheme)
                this.updateBodyClass()
            },
            immediate: true,
            deep: false
        },
        trips: {
            handler() {
                this.checkRouteParam()
            },
            immediate: true,
            deep: false
        },
        '$route.params.id': {
            handler(newId) {
                if (!newId) {
                    this.currentTrip = null
                } else {
                    this.checkRouteParam()
                }
            },
            immediate: true,
            deep: false
        }
    },
    mounted() {
        onAuthStateChanged(auth, (user) => {
            if (user && !this.isDemoMode) {
                this.user = user
                this.unsubscribe = subscribeTrips(user.uid, (data) => (this.trips = data))
            }
        })
        this.updateBodyClass()
    },
    methods: {
        updateBodyClass() {
            const body = document.body
            Object.values(themes).forEach((config) => {
                const classes = config.appClass.split(' ')
                body.classList.remove(...classes)
            })
            const activeClasses = this.activeThemeConfig.appClass.split(' ')
            body.classList.add(...activeClasses)
            body.classList.add('transition-colors', 'duration-500')
        },
        checkRouteParam() {
            const tripId = this.$route.params.id
            if (tripId && this.trips.length > 0) {
                const trip = this.trips.find((t) => t.id === tripId)
                if (trip) {
                    this.currentTrip = trip
                }
            }
        },
        async handleGoogleLogin() {
            try {
                await signInWithPopup(auth, googleProvider)
            } catch (e) {
                console.error(e)
            }
        },
        enterDemoMode() {
            this.isDemoMode = true
            this.user = { uid: 'demo-user', displayName: 'Demo Visitor' }
            const data = localStorage.getItem('maplio_demo_data')
            this.trips = data ? JSON.parse(data) : []
        },
        logout() {
            if (confirm('確定登出？')) {
                signOut(auth)
                location.reload()
            }
        },
        selectTrip(trip) {
            this.currentTrip = trip
            this.activeDay = 0
            this.$router.push({ name: 'trip', params: { id: trip.id } })
        },
        backToList() {
            this.currentTrip = null
            this.$router.push('/')
        },
        async handleDeleteTrip(id) {
            if (confirm('確定刪除整份行程？')) {
                if (this.isDemoMode) {
                    this.trips = this.trips.filter((t) => t.id !== id)
                    localStorage.setItem('maplio_demo_data', JSON.stringify(this.trips))
                } else {
                    await deleteTripDoc(id)
                }
            }
        },
        handleTripCreated() {
            this.showCreateForm = false
            if (this.isDemoMode) {
                const data = localStorage.getItem('maplio_demo_data')
                this.trips = data ? JSON.parse(data) : []
            }
        },
        handleAddDay() {
            this.currentTrip.itinerary.push({ spots: [] })
            this.activeDay = this.currentTrip.itinerary.length - 1
            this.saveData()
        },
        async handleDeleteDay() {
            if (
                this.currentTrip.itinerary.length > 1 &&
                confirm(`刪除 Day ${this.activeDay + 1}？`)
            ) {
                this.currentTrip.itinerary.splice(this.activeDay, 1)
                this.activeDay = Math.max(0, this.activeDay - 1)
                this.saveData()
            }
        },
        async copyToClipboard(text) {
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text)
                    return true
                } catch (err) {
                    console.error('Clipboard API 失敗', err)
                }
            }

            const textArea = document.createElement('textarea')
            textArea.value = text

            textArea.style.position = 'fixed'
            textArea.style.left = '-9999px'
            textArea.style.top = '0'
            document.body.appendChild(textArea)

            textArea.focus()
            textArea.select()

            try {
                const successful = document.execCommand('copy')
                document.body.removeChild(textArea)
                return successful
            } catch (err) {
                console.error(err)
                document.body.removeChild(textArea)
                return false
            }
        },
        async handleImportTrip() {
            try {
                let text = ''
                if (navigator.clipboard && window.isSecureContext) {
                    text = await navigator.clipboard.readText()
                } else {
                    text = prompt('您的瀏覽器不支援直接讀取剪貼簿，請在此貼上行程 JSON：')
                }

                if (!text) return

                const importedData = JSON.parse(text)

                if (!importedData.name || !Array.isArray(importedData.itinerary)) {
                    throw new Error('無效的行程格式：缺少名稱或行程清單')
                }

                const newTrip = {
                    ...importedData,
                    id: 'imp_' + Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    createdAt: new Date().toISOString(),
                    members: this.isDemoMode ? ['demo-user'] : [this.user.uid]
                }

                if (this.isDemoMode) {
                    this.trips.unshift(newTrip)
                    localStorage.setItem('maplio_demo_data', JSON.stringify(this.trips))
                    alert(`成功匯入行程：${newTrip.name}`)
                } else {
                    await saveTripData(newTrip.id, newTrip)
                    alert(`行程「${newTrip.name}」已同步至雲端！`)
                }
            } catch (err) {
                console.error('匯入失敗:', err)
                let errorMsg = '匯入失敗，請確認剪貼簿內容是否為正確的 JSON 格式。'
                if (err.name === 'NotAllowedError') errorMsg = '請授權瀏覽器讀取剪貼簿權限。'
                alert(errorMsg)
            }
        },
        async handleShareTrip() {
            if (!this.currentTrip) return

            if (this.isDemoMode) {
                const tripJson = JSON.stringify(this.currentTrip, null, 2)
                await this.executeShare('行程 JSON 資料', tripJson, true)
            } else {
                this.showShareDialog = true
            }
        },
        async handleShareChoice(choice) {
            this.showShareDialog = false

            if (choice === 'url') {
                const shareUrl = window.location.href
                await this.executeShare('旅程連結', shareUrl, false)
            } else if (choice === 'json') {
                const tripJson = JSON.stringify(this.currentTrip, null, 2)
                await this.executeShare('行程 JSON 資料', tripJson, true)
            }
        },
        async executeShare(label, content, isText) {
            const title = `Maplio ${label}: ${this.currentTrip.name}`

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: title,
                        [isText ? 'text' : 'url']: content
                    })
                    return
                } catch (err) {
                    if (err.name === 'AbortError') return
                    console.warn('原生分享失敗，轉用剪貼簿', err)
                }
            }
            const success = await this.copyToClipboard(content)
            if (success) {
                alert(`${label} 已複製到剪貼簿！`)
            } else {
                alert('複製失敗!')
            }
        },
        handleSearch(query) {
            if (query.startsWith('http')) {
                const parsed = parseGoogleMapUrl(query)
                this.manualSpot = parsed
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
                this.isEditingExistingSpot = false
                this.showManualSpotForm = true
            } else {
                this.performKeywordSearch(query)
            }
        },
        async performKeywordSearch(q) {
            this.isSearching = true
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`
                )
                this.searchResults = await res.json()
            } finally {
                this.isSearching = false
            }
        },
        handleLocationSelect(res) {
            const lat = parseFloat(res.lat)
            const lng = parseFloat(res.lon)
            this.manualSpot = {
                name: res.display_name.split(',')[0],
                lat: isNaN(lat) ? null : lat,
                lng: isNaN(lng) ? null : lng,
                url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                notes: '',
                timeStart: '',
                timeEnd: '',
                showOnMap: true,
                source: 'search'
            }
            this.showManualSpotForm = true
            this.searchResults = []
            if (this.$refs.searchBar) this.$refs.searchBar.clear()
        },
        startEditSpot(spot) {
            this.manualSpot = JSON.parse(JSON.stringify(spot))
            this.isEditingExistingSpot = true
            this.showManualSpotForm = true
        },
        addManualSpot(spotData) {
            if (this.isEditingExistingSpot) {
                const idx = this.currentDaySpots.findIndex((s) => s.id === spotData.id)
                if (idx !== -1) this.currentDaySpots[idx] = { ...spotData }
            } else {
                const spot = {
                    ...spotData,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    travelMode: 'auto',
                    showOnMap: !!(spotData.lat && spotData.lng)
                }
                this.currentDaySpots.push(spot)
            }
            if (this.$refs.searchBar) this.$refs.searchBar.clear()
            this.showManualSpotForm = false
            this.saveData()
        },
        async saveData() {
            if (this.currentTrip) {
                if (this.isDemoMode) {
                    const idx = this.trips.findIndex((t) => t.id === this.currentTrip.id)
                    if (idx !== -1) this.trips[idx] = JSON.parse(JSON.stringify(this.currentTrip))
                    localStorage.setItem('maplio_demo_data', JSON.stringify(this.trips))
                } else {
                    await saveTripData(this.currentTrip.id, this.currentTrip)
                }
            }
        },
        openSpotOnMaps(spot) {
            window.open(
                spot.url || `https://www.google.com/maps?q=${spot.lat},${spot.lng}`,
                '_blank'
            )
        },
        handleNavigate(start, end) {
            window.open(getNavUrl(start, end, start.travelMode), '_blank')
        },
        handleRemoveSpot(index) {
            this.currentDaySpots.splice(index, 1)
            this.saveData()
        },
        startEditTransport(spot) {
            this.editingTransportSpot = spot
            this.showTransportDialog = true
        },
        updateTransportInfo(updatedSpotData) {
            // 找到該景點並更新其交通屬性
            const idx = this.currentDaySpots.findIndex((s) => s.id === updatedSpotData.id)
            if (idx !== -1) {
                this.currentDaySpots[idx] = { ...updatedSpotData }
                this.saveData()
            }
            this.showTransportDialog = false
            this.editingTransportSpot = null
        }
    }
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.animate-fade {
    animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>

<style>
/* 修正日期、時間、數字輸入框在空值時的高度塌陷問題 */
input[type='date'],
input[type='time'],
input[type='number'] {
    -webkit-appearance: none;
    min-width: 0;
    box-sizing: border-box;
    /* 新增以下兩行：確保最小高度與一般輸入框一致 */
    min-height: 2.75rem; /* 約 44px，與 py-3 的高度相符 */
    line-height: 1.25rem;
}

/* 針對 iOS 額外處理，確保內容垂直置中 */
input[type='date'] {
    display: flex;
    align-items: center;
}
</style>
