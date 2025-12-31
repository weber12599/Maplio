<template>
    <div
        class="bg-slate-900 text-slate-100 font-sans h-screen flex flex-col overflow-hidden selection:bg-blue-500/30"
    >
        <LoginScreen
            v-if="!user"
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
                @logout="logout"
                @back="backToList"
                @create="showCreateForm = true"
            />

            <main class="flex-grow flex flex-col md:flex-row overflow-hidden relative">
                <div v-if="!currentTrip" class="flex-grow overflow-y-auto p-6 md:p-10 no-scrollbar">
                    <TripCreateForm
                        v-if="showCreateForm"
                        :isDemo="isDemoMode"
                        :user="user"
                        @cancel="showCreateForm = false"
                        @created="showCreateForm = false"
                    />
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                    >
                        <TripCard
                            v-for="trip in trips"
                            :key="trip.id"
                            :trip="trip"
                            @select="selectTrip"
                            @delete="handleDeleteTrip"
                        />
                    </div>
                </div>

                <template v-else>
                    <aside
                        class="w-full md:w-[450px] lg:w-[500px] flex flex-col h-full bg-slate-900 md:border-r border-slate-800 z-20 shrink-0"
                    >
                        <div
                            class="block md:hidden h-[220px] w-full shrink-0 bg-slate-900 border-b border-slate-800"
                        >
                            <LeafletMap mapId="mobile-map" :spots="currentDaySpots" />
                        </div>
                        <DayTabs
                            :itinerary="currentTrip.itinerary"
                            v-model:activeDay="activeDay"
                            :startDate="currentTrip.startDate"
                            @add-day="handleAddDay"
                            @delete-day="handleDeleteDay"
                        />
                        <div class="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
                            <SearchBar
                                ref="searchBar"
                                :loading="isSearching"
                                :results="searchResults"
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
                        </div>
                    </aside>
                    <LeafletMap
                        mapId="desktop-map"
                        :spots="currentDaySpots"
                        class="hidden md:block"
                    />
                </template>

                <SpotDialog
                    v-if="showManualSpotForm"
                    v-model="manualSpot"
                    @cancel="showManualSpotForm = false"
                    @confirm="addOrUpdateSpot"
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
import LoginScreen from './components/Auth/LoginScreen.vue'
import AppHeader from './components/Layout/AppHeader.vue'
import TripCard from './components/Trip/TripCard.vue'
import TripCreateForm from './components/Trip/TripCreateForm.vue'
import SpotItem from './components/Planner/SpotItem.vue'
import SpotDialog from './components/Trip/SpotDialog.vue'
import DayTabs from './components/Planner/DayTabs.vue'
import SearchBar from './components/Planner/SearchBar.vue'
import LeafletMap from './components/Map/LeafletMap.vue'

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
        LeafletMap
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
            appVersion: import.meta.env.VITE_APP_VERSION || 'v1.1.0'
        }
    },
    computed: {
        currentDaySpots: {
            get() {
                return this.currentTrip?.itinerary[this.activeDay]?.spots || []
            },
            set(val) {
                this.currentTrip.itinerary[this.activeDay].spots = val
            }
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
            this.user = { uid: 'demo-user' }
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
            if (confirm('確定刪除？')) {
                if (this.isDemoMode) {
                    this.trips = this.trips.filter((t) => t.id !== id)
                    localStorage.setItem('maplio_demo_data', JSON.stringify(this.trips))
                } else {
                    await deleteTripDoc(id)
                }
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
                confirm(`刪除 Day ${this.activeDay + 1}?`)
            ) {
                this.currentTrip.itinerary.splice(this.activeDay, 1)
                this.activeDay = Math.max(0, this.activeDay - 1)
                this.saveData()
            }
        },
        handleSearch(query) {
            const parsed = parseGoogleMapUrl(query)
            if (parsed) {
                this.manualSpot = { ...parsed, url: query, notes: '', timeStart: '', timeEnd: '' }
                this.isEditingExistingSpot = false
                this.showManualSpotForm = true
            } else if (query.startsWith('http')) {
                this.manualSpot = { url: query, notes: '', timeStart: '', timeEnd: '' }
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
            this.manualSpot = {
                name: res.display_name.split(',')[0],
                lat: parseFloat(res.lat),
                lng: parseFloat(res.lon),
                url: `https://www.google.com/maps/search/?api=1&query=${res.lat},${res.lon}`,
                notes: '',
                timeStart: '',
                timeEnd: ''
            }
            this.isEditingExistingSpot = false
            this.showManualSpotForm = true
            this.searchResults = []
            if (this.$refs.searchBar) {
                this.$refs.searchBar.clear()
            }
        },
        startEditSpot(spot) {
            this.manualSpot = JSON.parse(JSON.stringify(spot))
            this.isEditingExistingSpot = true
            this.showManualSpotForm = true
        },
        addOrUpdateSpot(spotData) {
            if (this.isEditingExistingSpot) {
                const idx = this.currentDaySpots.findIndex((s) => s.id === spotData.id)
                if (idx !== -1) {
                    this.currentDaySpots[idx] = { ...spotData }
                }
            } else {
                const spot = {
                    ...spotData,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    travelMode: 'auto',
                    showOnMap: spotData.lat && spotData.lng ? true : false
                }
                this.currentDaySpots.push(spot)
            }
            if (this.$refs.searchBar) {
                this.$refs.searchBar.clear()
            }

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
                spot.url ||
                    `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`,
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
            const n = prompt('輸入交通備註:', spot.transportNotes || '')
            if (n !== null) {
                spot.transportNotes = n
                this.saveData()
            }
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
