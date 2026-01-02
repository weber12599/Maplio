<template>
    <div
        :class="[
            'font-sans h-dvh flex flex-col overflow-hidden selection:bg-blue-500/30 transition-colors duration-500',
            activeThemeConfig.appClass
        ]"
    >
        <template v-if="!isLoginPage">
            <AppHeader
                v-if="authStore.user || authStore.isDemoMode"
                :user="authStore.user"
                :currentTrip="tripStore.currentTrip"
                :isDemo="authStore.isDemoMode"
                :showAddButton="!tripStore.currentTrip && !showCreateForm"
                :currentTheme="themeStore.activeTheme"
                :themeClass="activeThemeConfig.headerClass"
                :appVersion="appVersion"
                @logout="handleLogout"
                @back="backToList"
                @create="showCreateForm = true"
                @update-theme="themeStore.setTheme"
                @import="handleImportTrip"
                @share="handleHeaderShare"
            />
        </template>

        <main
            class="flex-grow flex flex-col md:flex-row overflow-hidden relative"
            style="
                padding-left: env(safe-area-inset-left);
                padding-right: env(safe-area-inset-right);
            "
        >
            <router-view v-slot="{ Component }">
                <component :is="Component" ref="viewComponent" />
            </router-view>

            <TripCreateForm
                v-if="showCreateForm"
                :isDemo="authStore.isDemoMode"
                :user="authStore.user"
                :themeConfig="activeThemeConfig"
                @cancel="showCreateForm = false"
                @created="handleTripCreated"
            />
        </main>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import AppHeader from './components/Layout/AppHeader.vue'
import TripCreateForm from './components/Trip/TripCreateForm.vue'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useTripStore } from './stores/trip'
import { saveTripData } from './services/tripService'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const tripStore = useTripStore()
const { activeThemeConfig } = storeToRefs(themeStore)

const showCreateForm = ref(false)
const viewComponent = ref(null)
const appVersion = import.meta.env.VITE_APP_VERSION || 'v0.0.0'

const isLoginPage = computed(() => route.name === 'login')

onMounted(async () => {
    const currentUser = await authStore.initAuthListener()
    if (currentUser || authStore.isDemoMode) {
        tripStore.initTripsListener()
    }
})

watch(
    () => authStore.user,
    (newUser) => {
        if (newUser) {
            tripStore.initTripsListener()
        } else if (!authStore.isDemoMode && route.meta.requiresAuth) {
            router.push('/login')
        }
    }
)

const handleLogout = async () => {
    await authStore.logout()
    router.push('/login')
}

const backToList = () => {
    tripStore.currentTrip = null
    router.push('/')
}

const handleTripCreated = () => {
    showCreateForm.value = false
}

const handleHeaderShare = () => {
    if (viewComponent.value && viewComponent.value.openShareDialog) {
        viewComponent.value.openShareDialog()
    }
}

const handleImportTrip = async () => {
    try {
        let text = ''
        if (navigator.clipboard && window.isSecureContext) {
            text = await navigator.clipboard.readText()
        } else {
            text = prompt('請在此貼上行程 JSON：')
        }
        if (!text) return

        const importedData = JSON.parse(text)
        if (!importedData.name || !Array.isArray(importedData.itinerary)) {
            throw new Error('無效的行程格式')
        }

        const newTrip = {
            ...importedData,
            id: 'imp_' + Date.now().toString() + Math.random().toString(36).substr(2, 5),
            createdAt: new Date().toISOString(),
            members: authStore.isDemoMode ? ['demo-user'] : [authStore.user.uid]
        }

        if (authStore.isDemoMode) {
            tripStore.addLocalTrip(newTrip)
            alert(`成功匯入：${newTrip.name}`)
        } else {
            await saveTripData(newTrip.id, newTrip)
            alert(`行程「${newTrip.name}」已同步至雲端！`)
        }
    } catch (err) {
        console.error('匯入失敗:', err)
        alert('匯入失敗，格式錯誤或權限不足')
    }
}
</script>
