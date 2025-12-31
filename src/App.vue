<template>
    <div
        :class="[
            'font-sans h-screen flex flex-col overflow-hidden selection:bg-blue-500/30 transition-colors duration-500',
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
                @logout="logout"
                @back="backToList"
                @create="showCreateForm = true"
                @update-theme="activeTheme = $event"
            />

            <main class="flex-grow flex flex-col md:flex-row overflow-hidden relative">
                <div v-if="!currentTrip" class="flex-grow overflow-y-auto p-6 md:p-10 no-scrollbar">
                    <TripCreateForm
                        v-if="showCreateForm"
                        :isDemo="isDemoMode"
                        :user="user"
                        @cancel="showCreateForm = false"
                        @created="handleTripCreated"
                    />
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
                        </div>
                    </aside>
                    <LeafletMap
                        mapId="desktop-map"
                        :spots="currentDaySpots"
                        :currentTheme="activeTheme"
                        class="hidden md:block"
                    />
                </template>

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
        TransportDialog
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
            activeTheme: localStorage.getItem('maplio_theme') || 'dark',
            appVersion: import.meta.env.VITE_APP_VERSION || 'v1.2.0'
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
        activeTheme(val) {
            localStorage.setItem('maplio_theme', val)
        }
    },
    mounted() {
        onAuthStateChanged(auth, (user) => {
            if (user && !this.isDemoMode) {
                this.user = user
                this.unsubscribe = subscribeTrips(user.uid, (data) => (this.trips = data))
            }
        })
    },
    methods: {
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
        },
        backToList() {
            this.currentTrip = null
            window.history.pushState({}, '', window.location.pathname)
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
